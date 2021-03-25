# Testing Electron Auto-Update
Testing the auto-update process can be a little involved. The most effective way to test this involves setting up your own release channel locally and making sure that you can notarize your builds.

**Note:** In order to test with a notarized build you'll need to have a paid Apple developer account.

## Setting up Min.IO
Rather than pushing new builds to the production S3 bucket, the best way to test locally is to use [Min.IO](https://min.io). Min.IO is an S3-compatible service that you can set up and deploy locally. In order to set up a local Min.IO instance to emulate an S3 bucket, follow these steps:

1. [Install Docker Desktop for Mac 🐳](https://docs.docker.com/docker-for-mac/install/) and make sure it's running. If you're not familiar with Docker, it might be a good idea to [follow the Docker quickstart](https://docs.docker.com/get-started/) and/or [learn more about Docker](https://docker-curriculum.com/).
1. Next, you can [install Min.IO](https://docs.min.io/docs/minio-docker-quickstart-guide.html) using the command: `brew install minio/stable/mc`
1. Now you can run Min.IO in a Docker container by executing this command:
   ```bash
   docker run -p 9000:9000 \
     -e "MINIO_ROOT_USER=USER"
     -e "MINIO_ROOT_PASSWORD=Password1"
     --name minio1
     minio/minio server /data
   ```
1. Next, confirm that the docker container is running using the command `docker ps`


Once you're running a local Min.IO instance (which emulates an S3 instance), the next step is to point your electron config at the Min.IO server. To do so, edit the [`publish` block of electon.config.js](https://github.com/Expensify/Expensify.cash/blob/bd776babbfa196fa7b29cef07590b71fc1df73ab/config/electron.config.js#L21-L25) to look like:
```
publish: [{
    provider: 's3',
    endpoint: 'http://localhost:9000',
    bucket: 'minio1',
    channel: 'latest',
}],
```

**Note:** while the `electron-updater` docs tell you to create a file named `dev-app-update.yaml`, this will **not** be helpful. Setting that file will, in development, tell the auto-updater where to look for builds. Unfortunately, on Mac the auto-updater will not install the new bits unless the app that is currently running is signed.

Now, you need to upload a build. Before you can do so, you need to make sure that you can notarize builds. For this you will need an [Apple Developer](https://developer.apple.com) account. Go to the [Certificates, Identifiers, and Profiles](https://developer.apple.com/account/resources/certificates/list) page and create a new certificate for a Developer ID Application. Follow the instructions to create a Certificate Signing Request, and once the certificate has been created, add it to your keychain with the Keychain Access app.

You will need to pass your Apple ID (username) and an [app-specific password](https://appleid.apple.com/account/manage) to the environment of the local desktop build. Entering your normal password will not work, so generate an app-specific password before continuing.

Now that your credentials have been set up properly, you can push a build to Min.IO. Start by updating the app version in `package.json` to something sufficiently high (i.e. `9.9.9-999`). Then run:

```bash
APPLE_ID=<your_apple_id_username> \
APPLE_ID_PASSWORD=<your_app_specific_password> \
npm run desktop-build
```

This will push your new build to the server.

Once this is done, revert the version update in `package.json`, remove `--publish always` from the `desktop-build` command and again run `npm run desktop-build`. From the `dist/` folder in the root of the project, you will find `Expensify.cash.dmg`. Open the `.dmg` and install the app. Your app will attempt to auto-update in the background.
