Function ReadFromRegistry(strRegistryKey, strDefault)
    Dim WSHShell, value
    On Error Resume Next
    Set WSHShell = CreateObject("WScript.Shell")
    value = WSHShell.RegRead( strRegistryKey )
    If err.number <> 0 Then
        readFromRegistry = strDefault
    Else
        readFromRegistry = value
    End If
    Set WSHShell = Nothing
End Function
vlc = ReadFromRegistry("HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\vlc.exe\", "Could not find VLC in registry...")
scriptDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
Set objShell = CreateObject("WScript.Shell")
'objShell.Run "node "& scriptDir & " .\setupConfig.cjs " & vlc, 1, True
command = "node """ & scriptDir & "\setupConfig.cjs"" """ & vlc & """"
objShell.Run command, 1, True
