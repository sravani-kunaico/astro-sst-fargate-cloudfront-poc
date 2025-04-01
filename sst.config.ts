/// <reference path="./.sst/platform/config.d.ts" />


export default $config({
  app(input) {
    return {
      name: "astro-sst-fargate-cloudfront-poc",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {

// ********** Creates a Fargate service with a load balancer and a custom rule to forward the traffic to the container **********
    const vpc = new sst.aws.Vpc("TestVpc");
    const cluster = new sst.aws.Cluster("TestCluster", { vpc });
    const service = new sst.aws.Service("TestService", {
      cluster,
      loadBalancer: {
        rules: [{ listen: "80/http", forward: "4321/http"},
                //{ listen: "443/https", forward: "4321/https" } // This needs to be uncommented when we have a custom domain defined for HTTPS protocol.
                                                                 // Once this is enabled, we can remove the transform property from the Router component. 
                                                                 // Because the Router component will automatically handle the HTTPS protocol.                    
                ],
      },
      dev: {
        command: "npm run dev",
      },
      
    });

// ********** Creates a Lambda function referring to handler logic with test endpoint **********
    const fn = new sst.aws.Function("MyFunction", {
      handler: "src/handler.handler",
      url: true,
    });

// ********** Create a bucket that cloudfront can access, upload test image to root folder **********
    const bucket = new sst.aws.Bucket("MyBucket", {
        access: "cloudfront",
    });
    new aws.s3.BucketObjectv2("MyImage", {
      bucket: bucket.name,
      key: "favicon.svg",
      contentType: "image/svg+xml",
      source: $asset("public/favicon.svg"),
    });

// ********** Creates a CDN with 3 routes, one to Lambda endpoint, one to S3 bucket and other to Fargate service **********.
    new sst.aws.Router("TestCDN", {
      routes: {
        "/lambda-app/*": { 
            url: fn.url,
            rewrite: {
              regex: "^/lambda-app/(.*)$",
              to: "/$1",
            },
        },
        "/s3-app/*": {
          bucket,
          rewrite: {
            regex: "^/s3-app/(.*)$",
            to: "/$1",
          },
        },
        "/*": {
          // Point to your service's load balancer URL
          url: service.url,
        }
      },
      transform: { // This is required to handle the HTTP protocol for the Fargate service since we haven't defined any custom domain with HTTPS protocol. 
                   // This section can be removed when we have a custom domain defined for the Fargate service with HTTPS protocol.
                   // This command will transform the origin pointing to the Fargate service to handle the HTTP protocol 
                   // and this communication is between CloudFront and the service load balancer.
        cdn: (args) => {
          args.origins = $resolve(args.origins).apply(origins => {
            return origins.map(origin => {
              // Apply transform only to the origin pointing to the Fargate service
              if (
                origin.customOriginConfig &&
                origin.domainName?.includes("elb.amazonaws.com") // Load balancer origin for Fargate service
              ) {
                return {
                  ...origin,
                  customOriginConfig: {
                    ...origin.customOriginConfig,
                    originProtocolPolicy: "http-only",
                    originReadTimeout: 60,
                    originKeepaliveTimeout: 60,
                  },
                };
              }
              // Leave Lambda origins untouched
              return origin;
            });
          });
        },
      }
      
    });
  }
});
