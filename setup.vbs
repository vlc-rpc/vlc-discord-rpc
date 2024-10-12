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

WScript.echo vlc 