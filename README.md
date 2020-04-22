# SBT Maven Publish

This action publishes an sbt project to maven.

## Inputs

### `sonatype-username`

**Required** The Sonatype/Nexus user name.

### `sonatype-password`

**Required** The Sonatype/Nexus password.

### `pgp-secret`

**Required** The PGP private key used for signing.

### `pgp-passphrase`

**Required** The PGP pass phrase.

### `pgp-public-key`

**Required** The PGP private key used to form the key ring.

### `sbt-args`

**Default** `+ publishSigned; sonatypeBundleRelease`

### `pgp-passphrase-variable-name`

**Default** `PGP_PASSPHRASE`

## Outputs

## Example usage

```yaml
uses: DamianReeves/sbt-maven-publish@master
with:
  sonatype-username: ${{ secrets.SONATYPE_USERNAME }}
  sonatype-password: ${{ secrets.SONATYPE_PASSWORD }}
  pgp-secret: $$ {{ secrets.PGP_SECRET }}
  pgp-passphrase: $$ {{ secrets.PGP_PASSPHRASE }}
  pgp-public-key: $$ {{ secrets.PGP_PUBLIC_KEY }}
```

Or if you want to change the sbt args used to publish so that tests are run first.

```yaml
uses: DamianReeves/sbt-maven-publish@master
with:
  sonatype-username: ${{ secrets.SONATYPE_USERNAME }}
  sonatype-password: ${{ secrets.SONATYPE_PASSWORD }}
  pgp-secret: $$ {{ secrets.PGP_SECRET }}
  pgp-passphrase: $$ {{ secrets.PGP_PASSPHRASE }}
  pgp-public-key: $$ {{ secrets.PGP_PUBLIC_KEY }}
  sbt-args: "+ test; publishSigned; sonatypeBundleRelease"
```
