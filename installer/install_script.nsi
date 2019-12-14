
;Include Modern UI

  !include "MUI2.nsh"

; The name of the installer
Name "TR216 Local Connector"

; The file to write
OutFile "TR216_LocalConnector_setup.exe"

; The default installation directory
InstallDir $PROGRAMFILES\TR216\LocalConnector

; Registry key to check for directory (so if you install again, it will 
; overwrite the old one automatically)
InstallDirRegKey HKLM "Software\TR216\LocalConnector" "Install_Dir"

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
;Section "TR216 Local Connector (required)"
Section "install"

  ;SectionIn RO
  
  ; Set output path to the installation directory.
  SetOutPath $INSTDIR
  
  ; Put file there
  
  
  File /r "dist\*.*"
  File /r "install_tools\*.*"

  ; Write the installation path into the registry
  WriteRegStr HKLM SOFTWARE\TR216\LocalConnector "Install_Dir" "$INSTDIR"
  
  ; Write the uninstall keys for Windows
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\TR216\LocalConnector" "DisplayName" "TR216 Local Connector"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\TR216\LocalConnector" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\TR216\LocalConnector" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\TR216\LocalConnector" "NoRepair" 1
  WriteUninstaller "uninstall.exe"
  
  CreateDirectory "$SMPROGRAMS\TR216\LocalConnector\"
  CreateShortcut "$SMPROGRAMS\TR216\LocalConnector\Uninstall.lnk" "$INSTDIR\uninstall.exe" "" "$INSTDIR\uninstall.exe" 0
  CreateShortcut "$SMPROGRAMS\TR216\LocalConnector\showmyid.lnk" "$INSTDIR\showmyid.bat" "Show ID/PASS" "$INSTDIR\showmyid.bat" 0
  CreateShortcut "$SMPROGRAMS\TR216\LocalConnector\changepassword.lnk" "$INSTDIR\changepassword.bat" "Parola Degistir" "$INSTDIR\changepassword.bat" 0
  ;create desktop shortcut
  CreateShortCut "$DESKTOP\TR216 Local Connector.lnk" "$INSTDIR\showmyid.bat" ""
  
 


SectionEnd

; Optional section (can be disabled by the user)
;Section "Start Menu Shortcuts"

 
  
;SectionEnd

;--------------------------------

; Uninstaller

Section "Uninstall"
  
  ; Remove registry keys
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\TR216\LocalConnector"
  DeleteRegKey HKLM SOFTWARE\TR216\LocalConnector

  ExpandEnvStrings $0 %COMSPEC%
  ExecWait '"$INSTDIR\nssm.exe" stop "TR216 Local Connector"'
  ExecWait '"$INSTDIR\nssm.exe" remove "TR216 Local Connector" confirm'


  ; Remove files and uninstaller
  ;Delete $INSTDIR\showmyid.bat
  ;Delete $INSTDIR\changepassword.bat
  ;Delete $INSTDIR\uninstall.exe
  Delete $INSTDIR\*.*

  ; Remove shortcuts, if any
  Delete "$SMPROGRAMS\TR216\LocalConnector\*.*"
  Delete "$DESKTOP\TR216 Local Connector.lnk"

  ; Remove directories used
  RMDir "$SMPROGRAMS\TR216\LocalConnector"
  RMDir /r "$INSTDIR"

SectionEnd


Function installServices
  
  ExpandEnvStrings $0 %COMSPEC%
  Exec '"$INSTDIR\nssm.exe" install "TR216 Local Connector"  "$INSTDIR\node.exe" "start.js"'
  Exec '"$INSTDIR\nssm.exe" set "TR216 Local Connector" AppParameters "start.js"'
  Exec '"$INSTDIR\nssm.exe" set "TR216 Local Connector" AppDirectory $INSTDIR\'
  Exec '"$INSTDIR\nssm.exe" set "TR216 Local Connector" AppStdout $INSTDIR\log.log'
  Exec '"$INSTDIR\nssm.exe" set "TR216 Local Connector" AppStderr $INSTDIR\error.log'
  Exec '"$INSTDIR\nssm.exe" set "TR216 Local Connector" AppStopMethodSkip 6'
  Exec '"$INSTDIR\nssm.exe" set "TR216 Local Connector" AppStopMethodConsole 1000'
  Exec '"$INSTDIR\nssm.exe" set "TR216 Local Connector" AppThrottle 5000'
  Exec '"$INSTDIR\nssm.exe" start "TR216 Local Connector"'

FunctionEnd
