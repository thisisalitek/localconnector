
;Include Modern UI

  !include "MUI2.nsh"

; The name of the installer
Name "GANYGO Local Connector"

; The file to write
OutFile "GANYGO_LocalConnector_setup.exe"

; The default installation directory
InstallDir $PROGRAMFILES\GANYGO\LocalConnector

; Registry key to check for directory (so if you install again, it will 
; overwrite the old one automatically)
InstallDirRegKey HKLM "Software\GANYGO\LocalConnector" "Install_Dir"

; Request application privileges for Windows Vista
RequestExecutionLevel admin

;--------------------------------

; Pages

Page components
Page directory
Page instfiles

UninstPage uninstConfirm
UninstPage instfiles

;--------------------------------

 
;-------------------------------- 
;Modern UI System
 
  ;;;!insertmacro MUI_SYSTEM 
  !define MUI_PAGE_CUSTOMFUNCTION_LEAVE installServices
  !insertmacro MUI_PAGE_FINISH
  
  !insertmacro MUI_LANGUAGE "Turkish"
  !insertmacro MUI_LANGUAGE "English"



; The stuff to install
;Section "GANYGO Local Connector (required)"
Section "install"

  ;SectionIn RO
  
  ; Set output path to the installation directory.
  SetOutPath $INSTDIR
  
  ; Put file there
  
  
  File /r "dist\*.*"
  File /r "install_tools\*.*"

  ; Write the installation path into the registry
  WriteRegStr HKLM SOFTWARE\GANYGO\LocalConnector "Install_Dir" "$INSTDIR"
  
  ; Write the uninstall keys for Windows
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\GANYGO\LocalConnector" "DisplayName" "GANYGO Local Connector"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\GANYGO\LocalConnector" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\GANYGO\LocalConnector" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\GANYGO\LocalConnector" "NoRepair" 1
  WriteUninstaller "uninstall.exe"
  
  CreateDirectory "$SMPROGRAMS\GANYGO\LocalConnector\"
  CreateShortcut "$SMPROGRAMS\GANYGO\LocalConnector\Uninstall.lnk" "$INSTDIR\uninstall.exe" "" "$INSTDIR\uninstall.exe" 0
  CreateShortcut "$SMPROGRAMS\GANYGO\LocalConnector\showmyid.lnk" "$INSTDIR\showmyid.bat" "Show ID/PASS" "$INSTDIR\showmyid.bat" 0
  CreateShortcut "$SMPROGRAMS\GANYGO\LocalConnector\changepassword.lnk" "$INSTDIR\changepassword.bat" "Parola Degistir" "$INSTDIR\changepassword.bat" 0
  ;create desktop shortcut
  CreateShortCut "$DESKTOP\GANYGO Local Connector.lnk" "$INSTDIR\showmyid.bat" ""
  
 


SectionEnd

; Optional section (can be disabled by the user)
;Section "Start Menu Shortcuts"

 
  
;SectionEnd

;--------------------------------

; Uninstaller

Section "Uninstall"
  
  ; Remove registry keys
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\GANYGO\LocalConnector"
  DeleteRegKey HKLM SOFTWARE\GANYGO\LocalConnector

  ExpandEnvStrings $0 %COMSPEC%
  ExecWait '"$INSTDIR\nssm.exe" stop "GANYGO Local Connector"'
  ExecWait '"$INSTDIR\nssm.exe" remove "GANYGO Local Connector" confirm'


  ; Remove files and uninstaller
  ;Delete $INSTDIR\showmyid.bat
  ;Delete $INSTDIR\changepassword.bat
  ;Delete $INSTDIR\uninstall.exe
  Delete $INSTDIR\*.*

  ; Remove shortcuts, if any
  Delete "$SMPROGRAMS\GANYGO\LocalConnector\*.*"
  Delete "$DESKTOP\GANYGO Local Connector.lnk"

  ; Remove directories used
  RMDir "$SMPROGRAMS\GANYGO\LocalConnector"
  RMDir /r "$INSTDIR"

SectionEnd


Function installServices
  
  ExpandEnvStrings $0 %COMSPEC%
  Exec '"$INSTDIR\nssm.exe" install "GANYGO Local Connector"  "$INSTDIR\node.exe" "start.js"'
  Exec '"$INSTDIR\nssm.exe" set "GANYGO Local Connector" AppParameters "start.js"'
  Exec '"$INSTDIR\nssm.exe" set "GANYGO Local Connector" AppDirectory $INSTDIR\'
  Exec '"$INSTDIR\nssm.exe" set "GANYGO Local Connector" AppStdout $INSTDIR\log.log'
  Exec '"$INSTDIR\nssm.exe" set "GANYGO Local Connector" AppStderr $INSTDIR\error.log'
  Exec '"$INSTDIR\nssm.exe" set "GANYGO Local Connector" AppStopMethodSkip 6'
  Exec '"$INSTDIR\nssm.exe" set "GANYGO Local Connector" AppStopMethodConsole 1000'
  Exec '"$INSTDIR\nssm.exe" set "GANYGO Local Connector" AppThrottle 5000'
  Exec '"$INSTDIR\nssm.exe" start "GANYGO Local Connector"'

FunctionEnd
