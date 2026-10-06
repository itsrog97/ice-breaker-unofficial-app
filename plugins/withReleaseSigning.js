/**
 * Expo config plugin: sign Android release builds with an upload key when
 * `android/keystore.properties` (git-ignored) exists; otherwise keep Expo's
 * default debug signing so internal test APKs still build.
 *
 * keystore.properties:
 *   storeFile=/absolute/path/to/upload.keystore
 *   storePassword=...
 *   keyAlias=...
 *   keyPassword=...
 */
const { withAppBuildGradle } = require('expo/config-plugins');

const MARKER = '// @icebreaker/release-signing';

const SNIPPET = `
${MARKER}
def ibKeystorePropsFile = rootProject.file("keystore.properties")
def ibKeystoreProps = new Properties()
if (ibKeystorePropsFile.exists()) {
    ibKeystorePropsFile.withInputStream { ibKeystoreProps.load(it) }
}
android {
    signingConfigs {
        if (ibKeystorePropsFile.exists()) {
            release {
                storeFile file(ibKeystoreProps['storeFile'])
                storePassword ibKeystoreProps['storePassword']
                keyAlias ibKeystoreProps['keyAlias']
                keyPassword ibKeystoreProps['keyPassword']
            }
        }
    }
    buildTypes {
        release {
            if (ibKeystorePropsFile.exists()) {
                signingConfig signingConfigs.release
            }
        }
    }
}
`;

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (!cfg.modResults.contents.includes(MARKER)) {
      cfg.modResults.contents += SNIPPET;
    }
    return cfg;
  });
};
