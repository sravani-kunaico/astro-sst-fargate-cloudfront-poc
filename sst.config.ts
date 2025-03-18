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

    const vpc = new sst.aws.Vpc("MyVpc");
    const cluster = new sst.aws.Cluster("MyCluster", { vpc });
  
    const service = new sst.aws.Service("MyService", {
      cluster,
      loadBalancer: {
        rules: [{ listen: "80/http", forward: "4321/http" }],
      },
      dev: {
        command: "npm run dev",
      },
      
    });

    new sst.aws.Router("MyServiceCDN", {
      routes: {
        "/*": {
          // Point to your service's load balancer URL
          url: service.url
        }
      },
      transform: {  // This is just to transform the origin to http-only since load balancer is using http. 
                    // This communication is between cloudfront and load balancer
        cdn: (args) => {
          // Use $resolve to unwrap the Input type
          args.origins = $resolve(args.origins).apply(origins => {
            // Now we can modify the origins array
            return origins.map(origin => {
              if (origin.customOriginConfig) {
                return {
                  ...origin,
                  customOriginConfig: {
                    ...origin.customOriginConfig,
                    originProtocolPolicy: "http-only",
                    originReadTimeout: 60,
                    originKeepaliveTimeout: 60
                  }
                };
              }
              return origin;
            });
          });
        }
      }
    });
  }
});
