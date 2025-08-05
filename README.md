# ECA-PRO

This repository contains the visualization tool for ECA-PRO.

## Installation

You can download the most recent version of the app from the [releases](https://github.com/DanielKerrigan/ECA-PRO/releases).

### Windows

`ECA-PRO-X.Y.Z.Setup.exe` is the installation executable for version X.Y.Z. Downloading and running this file will install the ECA-PRO app. Note that this app is not code signed, so when you try to run the setup executable, Windows will likely warn you about it. To run the installer, you can click "More info" and then "Run anyway". This will install `ECA-PRO.exe` and create shortcuts. On my computer, the app is installed to `%LocalAppData%\eca_pro`.

Alternatively, if you do not want to use the installer, `ECA-PRO-win32-x64-X.Y.Z.zip` contains the app's executable and dependencies for version X.Y.Z. After downloading and unzipping the file, you will find the `ECA-PRO.exe` application. If you try to run this, Windows will prompt you to first extract all files in the folder. After doing that, you can then run ECA-PRO. This app is not code signed, so Windows will likely warn you about this. You can click "More info" and then "Run anyway" to run the app.

## Usage

To load data into the app, open the Settings menu. On Windows, this is under `File > Settings`. Select the corresponding PRO and treatment files, click "Save changes", and then close out of the Settings menu. You can then select a patient to view the visualizations.
