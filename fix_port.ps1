$content = Get-Content 'src/lib/api.js' -Raw
$content = $content -replace  '5000'
Set-Content -Path 'src/lib/api.js' -Value $content
Write-Host "Fixed port in api.js"
