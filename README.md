# SBT Maven Publish

This action publishes an sbt project to maven.

## Inputs

### `who-to-greet`

**Required** The name of the person to greet. Default `"World"`.

## Outputs

### `time`

The time we greeted you.

## Example usage

uses: DamianReeves/sbt-maven-publish@master
with:
who-to-greet: 'Mona the Octocat'
