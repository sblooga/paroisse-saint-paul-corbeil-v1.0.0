<# =====================================================================
Script   : Backup-Projet-Complet.ps1
Auteur   : Richard Szuszkiewicz
Objet    : Sauvegarde complète du projet (avec historique Git)
Version  : 3.0
===================================================================== #>

# --- 1. PARAMÈTRES CONFIGURABLES ---
$ProjectPath    = "D:\PROJET-NODEJS\site2-paroisse-saint-paul-corbeil-v1.0.0\!RACINE-DEV\paroisse-saint-paul-corbeil"
$BackupPath     = "D:\PROJET-NODEJS\BACKUP\site2-paroisse-saint-paul-corbeil-v1.0.0\Complet"
$ReadmeFileName = "LisezMoi-COMPLET"
$MaxBackups     = 5

# --- 2. VÉRIFICATIONS ---
if (!(Test-Path $ProjectPath)) {
    Write-Host "❌ ERREUR : Le dossier projet est introuvable : $ProjectPath" -ForegroundColor Red
    exit 1
}
if (!(Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath | Out-Null
}

# --- 3. VERSIONNING ---
$VersionFile = Join-Path $BackupPath "backup_version_complet.txt"
if (!(Test-Path $VersionFile)) { "1.0" | Out-File $VersionFile -Encoding UTF8 }

$CurrentVersion = Get-Content $VersionFile
if ($CurrentVersion -match "(\d+)\.(\d+)") {
    [int]$Major = $matches[1]; [int]$Minor = $matches[2]
} else {
    $Major = 1; $Minor = 0; $CurrentVersion = "1.0"
}

# --- 4. PRÉPARATION ---
$DateStamp        = (Get-Date).ToString("yyyy-MM-dd_HH-mm-ss")
$BackupFolderName = "Backup_COMPLET_V$CurrentVersion`_$DateStamp"
$BackupFullPath   = Join-Path $BackupPath $BackupFolderName
New-Item -ItemType Directory -Path $BackupFullPath | Out-Null

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "🚀 SAUVEGARDE COMPLÈTE V$CurrentVersion EN COURS..." -ForegroundColor Cyan
Write-Host "=============================================="

# --- 5. COPIE RAPIDE (Exclusion node_modules + artefacts, MAIS PAS .git) ---
$LogArgs = @("/NFL", "/NDL", "/NJH", "/NJS", "/R:0", "/W:0")

robocopy $ProjectPath $BackupFullPath /E `
  /XD "node_modules" ".vscode" "dist" "build" "coverage" `
  @LogArgs

if ($LASTEXITCODE -ge 8) {
    Write-Host "❌ Erreur critique copie." -ForegroundColor Red
} else {
    Write-Host "✅ Fichiers copiés (sauvegarde complète avec .git)." -ForegroundColor Green
}

# --- 6. ANALYSE DU PACKAGE.JSON ---
$PackageJsonPath  = Join-Path $ProjectPath "package.json"
$DependenciesText = "*Non détecté*"

if (Test-Path $PackageJsonPath) {
    try {
        $JsonContent = Get-Content $PackageJsonPath -Raw | ConvertFrom-Json
        $Deps        = $JsonContent.dependencies
        if ($Deps) {
            $DependenciesText = ""
            $Deps.PSObject.Properties | ForEach-Object {
                $DependenciesText += "- **$($_.Name)** : $($_.Value)`r`n"
            }
        }
    } catch {
        $DependenciesText = "Erreur lecture package.json"
    }
}

# --- 7. GÉNÉRATION DU LISEZ-MOI (COMPLET) ---
$Txt  = ""
$Txt += "# 💾 SAUVEGARDE PROJET (COMPLÈTE) - VERSION v$CurrentVersion`r`n"
$Txt += "`r`n"
$Txt += "- **Date** : $(Get-Date -Format 'dd/MM/yyyy à HH:mm')`r`n"
$Txt += "- **Script** : Backup-Paroisse-Complet v3.0`r`n"
$Txt += "`r`n"
$Txt += "---`r`n"
$Txt += "`r`n"
$Txt += "## 🆘 GUIDE DE RESTAURATION (SAUVEGARDE COMPLÈTE)`r`n"
$Txt += "`r`n"
$Txt += "Cette sauvegarde est complète :`r`n"
$Txt += "- le dossier `.git` est inclus (historique Git, branches, remotes)`r`n"
$Txt += "- le dossier `node_modules` est exclu pour limiter la taille`r`n"
$Txt += "`r`n"
$Txt += "Après restauration, vous conservez tout l'historique Git, mais vous devez réinstaller les dépendances Node.js.`r`n"
$Txt += "`r`n"
$Txt += "### 👉 Procédure de restauration :`r`n"
$Txt += "`r`n"
$Txt += "1. Copiez ce dossier sauvegarde à l'emplacement souhaité.`r`n"
$Txt += "2. Ouvrez ce dossier dans **VS Code**.`r`n"
$Txt += "3. Dans le terminal (PowerShell ou intégré VS Code), exécutez :`r`n"
$Txt += "   npm install`r`n"
$Txt += "`r`n"
$Txt += "4. Lancez votre site avec :`r`n"
$Txt += "   npm run dev`r`n"
$Txt += "`r`n"
$Txt += "5. Si nécessaire, vérifiez le remote Git avec :`r`n"
$Txt += "   git remote -v`r`n"
$Txt += "`r`n"
$Txt += "---`r`n"
$Txt += "`r`n"
$Txt += "## 📦 Contenu technique`r`n"
$Txt += "Liste des dépendances (package.json) qui seront réinstallées par `npm install` :`r`n"
$Txt += "`r`n"
$Txt += $DependenciesText
$Txt += "`r`n"
$Txt += "---`r`n"
$Txt += "*Sauvegarde complète générée automatiquement (avec historique Git).*`r`n"

$ReadmeFullPath = Join-Path $BackupFullPath "$ReadmeFileName-v$CurrentVersion.md"
$Txt | Out-File $ReadmeFullPath -Encoding UTF8
Write-Host "📝 Guide de restauration (complet) : $ReadmeFileName-v$CurrentVersion.md" -ForegroundColor Green

# --- 8. PROCHAINE VERSION & ROTATION ---
$NextMinor = $Minor + 1
$NextMajor = $Major
if ($NextMinor -ge 10) { $NextMajor++; $NextMinor = 0 }
"$NextMajor.$NextMinor" | Out-File $VersionFile -Encoding UTF8

$Backups = Get-ChildItem -Path $BackupPath -Directory |
           Where-Object { $_.Name -like "Backup_COMPLET_V*" } |
           Sort-Object CreationTime

if ($Backups.Count -gt $MaxBackups) {
    $Oldest = $Backups | Select-Object -First ($Backups.Count - $MaxBackups)
    foreach ($Old in $Oldest) {
        Write-Host "⚠️ Limite atteinte (complet). Ancien : $($Old.Name)" -ForegroundColor Yellow
        $Confirm = Read-Host "❓ Supprimer ? (O/N)"
        if ($Confirm -eq 'O') {
            Remove-Item $Old.FullName -Recurse -Force
            Write-Host "🗑️ Supprimé." -ForegroundColor DarkYellow
        }
    }
}

Write-Host "✅ SAUVEGARDE COMPLÈTE TERMINÉE." -ForegroundColor Cyan
