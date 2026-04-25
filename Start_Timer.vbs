Set WshShell = CreateObject("WScript.Shell")
' Run the timer without any terminal window showing
WshShell.Run "cmd.exe /c npx electron . --no-sandbox", 0
