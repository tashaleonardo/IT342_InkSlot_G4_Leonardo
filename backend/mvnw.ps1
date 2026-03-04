#!/usr/bin/env pwsh
# Maven Start Up Script for Windows PowerShell

$MVN_WRAPPER_JAR = "$PSScriptRoot\.mvn\wrapper\maven-wrapper.jar"
$JAVA_HOME = $env:JAVA_HOME
$PROJECT_BASE_DIR = $PSScriptRoot

if (-not $JAVA_HOME) {
    $javaCmd = "java"
} else {
    $javaCmd = "$JAVA_HOME\bin\java.exe"
}

if (-not (Test-Path $MVN_WRAPPER_JAR)) {
    Write-Error "Maven wrapper JAR not found at: $MVN_WRAPPER_JAR"
    exit 1
}

& $javaCmd "-Dmaven.multiModuleProjectDirectory=$PROJECT_BASE_DIR" -cp $MVN_WRAPPER_JAR org.apache.maven.wrapper.MavenWrapperMain @args
