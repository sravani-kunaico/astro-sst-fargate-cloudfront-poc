# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

Pre-Requisites:
---------------
- Node installed
- Astro project created
- AWS credentials configured
- Docker and Docker Desktop installed

Steps:
------
1. Once Astro project is created, cd into current project
2.  Now initialize SST in your application
        
        npx sst@latest init
3. Once SST is initialized, it will create new file sst.config.ts, sst-env.d.ts, modify tsconfig.json, add sst to package.json.
4. The sst.config.ts file is the main configuration file for SST, which is a framework for deploying serverless applications on AWS. It defines infrastructure and deployment settings.
5. Update astro.config.mjs file to use node adapter which is recommended for Fargate service deployment. (This bundles everything needed to run the server into a single self-contained build output.) Although this application has 3 routes pointing to 3 different services, I've used node adapter. We can change this based on if its static application or SSR or node etc.,

        npx astro add node // Adds nodejs adapter.
                
6. We can then modify sst.config.ts file to add infrastructure needed. After making these changes, we are good to go.
7. To start in dev mode
        
        npx sst dev // run your AWS application locally while simulating a live AWS environment with hot reloading.
8. To deploy to AWS
        
        npx sst deploy // Fully deploys the app to AWS 
9. Since we are working with containers for fargate deployment, we need a Dockerfile to build and run Astro application. During deployment it automatically picks the Dockerfile from the root of the project.
10. For POC purpose, I've also uploaded static image to S3 and deployed a test handler to lambda.
11. Once its deployed successfully, it will generate cloudfront URL where you can access your application.
12. In total, this application has CDN configured with 3 routes, one pointing to Lambda, other to static image hosted on S3 bucket and other to Fargate service.

Below are the 3 routes to access:
```
    <cloudfront-url>/lambda-app/test -- To access test endpoint deployed to Lambda
    <cloudfront-url>/s3-app/favicon.svg -- To access static image deployed to S3
    <cloudfront-url> -- To access application deployed to fargate service
```

## 👀 Want to learn more about SST?

Feel free to check [SST Documentation](https://sst.dev/docs)