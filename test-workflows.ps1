function Write-Header {
    param([string]$Message)
    Write-Host "`n=== $Message ===" -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Message)
    Write-Host "`n-> $Message" -ForegroundColor Yellow
}

function Test-CommandExists {
    param([string]$Command)
    
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    } catch {
        return $false
    }
}

function Test-Command {
    param(
        [string]$StepName,
        [string]$Command
    )
    
    Write-Step $StepName
    Write-Host "Executing: $Command" -ForegroundColor Gray
    
    try {
        $output = Invoke-Expression $Command 2>&1
        $exitCode = $LASTEXITCODE
        
        Write-Host $output
        
        if ($exitCode -eq 0) {
            Write-Host "✓ $StepName passed" -ForegroundColor Green
            return $true
        } else {
            Write-Host "✗ $StepName failed with exit code $exitCode" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "✗ $StepName failed with error: $_" -ForegroundColor Red
        return $false
    }
}

# Vérifier la présence de npm
if (-not (Test-CommandExists "npm")) {
    Write-Host "npm is not found in PATH. Please ensure Node.js is installed and in your PATH" -ForegroundColor Red
    exit 1
}

Write-Host "Node version:" -ForegroundColor Cyan
node -v
Write-Host "NPM version:" -ForegroundColor Cyan
npm -v

# Simulate build.yml workflow
Write-Header "Running build.yml workflow"

Write-Step "Checking package-lock.json"
if (-not (Test-Path "package-lock.json")) {
    Write-Host "No package-lock.json found, generating..." -ForegroundColor Yellow
    if (-not (Test-Command "Generate package-lock.json" "npm install")) { exit 1 }
} else {
    Write-Host "package-lock.json exists" -ForegroundColor Green
}

if (-not (Test-Command "Install dependencies" "npm ci")) { exit 1 }
if (-not (Test-Command "Build project" "npm run build")) { exit 1 }
if (-not (Test-Command "Run tests" "npm test")) { exit 1 }

# Simulate ci.yml workflow
Write-Header "Running ci.yml workflow"

if (-not (Test-Command "Install dependencies" "npm install")) { exit 1 }
if (-not (Test-Command "Run ESLint" "npm run lint")) { exit 1 }
if (-not (Test-Command "Check formatting" "npm run format:check")) { exit 1 }

Write-Host "`nAll workflows completed successfully!" -ForegroundColor Green