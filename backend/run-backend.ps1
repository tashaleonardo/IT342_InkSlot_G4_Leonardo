$env:MAVEN_HOME = "C:\Users\Natasha\Downloads\apache-maven-3.9.11-bin\apache-maven-3.9.11"
$env:Path = "$env:MAVEN_HOME\bin;$env:Path"
Set-Location $PSScriptRoot
& "$env:MAVEN_HOME\bin\mvn.cmd" spring-boot:run
