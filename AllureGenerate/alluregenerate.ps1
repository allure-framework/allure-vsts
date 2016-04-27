param(
    [string]allureRunner,
    [string]resultsDir,
    [string]targetDir
)


Write-Verbose "allureRunner = $allureRunner"
Write-Verbose "resultsDir = $resultsDir"
Write-Verbose "targetDir = $targetDir"

# Import the Task.Common and Task.Internal dll that has all the cmdlets we need for Build
import-module "Microsoft.TeamFoundation.DistributedTask.Task.Internal"
import-module "Microsoft.TeamFoundation.DistributedTask.Task.Common"


allure.bat generate --output %targetDir% %resultsDir%`


# Set the paths of the Start and Kill Android Emulator scripts, which are in the same directory as AndroidBuild.ps1
$PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
$StartEmulatorScript = Join-Path -Path $PSScriptRoot -ChildPath "StartAndroidEmulator.ps1"
$KillEmulatorScript = Join-Path -Path $PSScriptRoot -ChildPath "KillAndroidEmulator.ps1"

# Always invoke the start up script, let the script handle create and start emulator checks
$createAvdArgs = "-avdName `"$avdName`" -createAvd $createAvd -avdTarget `"$emulatorTarget`" -avdDevice `"$emulatorDevice`" -avdAbi `"$avdAbi`" -avdForceOverwrite $avdForce -avdOptionalArgs `"$avdOptionalArgs`""
$emulatorArgs = "-startEmulator $startEmulator -timeout `"$emulatorTimeout`" -headlessEmulator $emulatorHeadless -emulatorOptionalArgs `"$emulatorOptionalArgs`""
$startEmulatorCommand = "& `"$StartEmulatorScript`" $createAvdArgs $emulatorArgs"
Write-Verbose "Calling start emulator script: $startEmulatorCommand"
Invoke-Expression -Command $startEmulatorCommand

# Use Gradle Wrapper
if ([System.IO.File]::Exists($gradleWrapper))
{
    Write-Verbose "Invoking gradle wrapper $gradleWrapper with arguments $gradleArguments in working directory $gradleProj"
    Invoke-BatchScript $gradleWrapper -Arguments $gradleArguments -WorkingFolder $gradleProj
}
else
{
    throw "Unable to find script $gradleWrapper"
}

# Always invoke the post build script, emulator must be stopped if we started it
# otherwise task hangs
$killEmulatorCommand = "& `"$KillEmulatorScript`" `"$avdName`" $startEmulator $deleteAvd"
Write-Verbose "Calling stop emulator script with command: $killEmulatorCommand"
Invoke-Expression -Command $killEmulatorCommand

Write-Verbose "Leaving script AndroidBuild.ps1"