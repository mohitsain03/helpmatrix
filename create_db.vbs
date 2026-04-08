Set cat = CreateObject("ADOX.Catalog")
cat.Create "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=HelpMatrix.accdb;"
Set cat = Nothing
WScript.Echo "Database HelpMatrix.accdb created successfully."
