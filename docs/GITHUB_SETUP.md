# Push Souvenir Spartan to GitHub

## 1. Create a GitHub account (if you don’t have one)

1. Go to **https://github.com/join**
2. Enter your email, password, and username.
3. Verify your email and complete sign-up.

## 2. Create a new repository on GitHub

1. Log in at **https://github.com**
2. Click the **+** (top right) → **New repository**
3. **Repository name:** `souvenir-spartan` (or any name you like)
4. **Description:** optional, e.g. `Souvenir Spartan – affiliate e‑commerce site`
5. Choose **Public**
6. **Do not** check “Add a README” (the project already has one)
7. Click **Create repository**

## 3. Push this project from your computer

In a terminal, from the project folder (`c:\Users\Hella\spartan`), run:

```powershell
cd c:\Users\Hella\spartan

# If git isn’t initialized yet:
git init

# Stage all files (respects .gitignore: skips node_modules and .env)
git add .

# First commit
git commit -m "Initial commit: Souvenir Spartan site and product API"

# Add your GitHub repo as remote (replace YOUR_USERNAME and REPO_NAME with yours)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename branch to main (if needed) and push
git branch -M main
git push -u origin main
```

Replace **YOUR_USERNAME** with your GitHub username and **REPO_NAME** with the repo you created (e.g. `souvenir-spartan`).

Example:

```powershell
git remote add origin https://github.com/jsmith/souvenir-spartan.git
git branch -M main
git push -u origin main
```

GitHub will ask for your username and password. For password, use a **Personal Access Token** (Settings → Developer settings → Personal access tokens), not your account password.

## 4. Optional: GitHub CLI

If you use [GitHub CLI](https://cli.github.com/) (`gh`):

```powershell
gh auth login
gh repo create souvenir-spartan --public --source=. --remote=origin --push
```

That creates the repo and pushes in one go.
