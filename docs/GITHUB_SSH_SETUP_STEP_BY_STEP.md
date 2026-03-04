# Step-by-Step: Push DataSense AI to GitHub with SSH

Follow these steps **one at a time**. Do not skip ahead.

---

## Part 1: Create an SSH key on your Mac

### Step 1
Open **Terminal** (search "Terminal" in Spotlight or find it in Applications → Utilities).

---

### Step 2
Type this command and press **Enter**:

```
ssh-keygen -t ed25519 -C "rvakati@gmu.edu"
```

---

### Step 3
When it asks: **"Enter file in which to save the key"**

- Do **not** type anything.
- Just press **Enter**.

---

### Step 4
When it asks: **"Enter passphrase"**

- Either press **Enter** for no passphrase, **or**
- Type a password you will remember and press **Enter**.

---

### Step 5
When it asks: **"Enter same passphrase again"**

- Press **Enter** again (if you used no passphrase), **or**
- Type the same password again and press **Enter**.

---

### Step 6
You should see: **"Your identification has been saved..."** and **"Your public key has been saved..."**

- If you see that, Part 1 is done. Go to Part 2.

---

## Part 2: Copy your public SSH key

### Step 7
In Terminal, type this and press **Enter**:

```
cat ~/.ssh/id_ed25519.pub
```

---

### Step 8
Terminal will show **one long line** of text. It starts with `ssh-ed25519` and ends with your email.

- **Select that entire line** (triple-click to select the line).
- Press **Cmd + C** to copy it.
- Keep it copied; you will paste it in GitHub in Part 3.

---

## Part 3: Add the SSH key to GitHub

### Step 9
Open your web browser and go to: **https://github.com**

- Log in with your GitHub account (rutvij1407).

---

### Step 10
Click your **profile picture** (top-right corner of the page).

---

### Step 11
Click **Settings** in the dropdown menu.

---

### Step 12
On the left sidebar, scroll down until you see **"Developer settings"**.

- Click **Developer settings**.

---

### Step 13
On the left sidebar, click **"Personal access tokens"**.

- Then click **"SSH and GPG keys"** (or find it in the list).

---

### Step 14
You will see two tabs at the top: **"SSH keys"** and **"GPG keys"**.

- Click the **"SSH keys"** tab.
- Make sure **SSH keys** is selected (not GPG keys).

---

### Step 15
Click the green button: **"New SSH key"**.

---

### Step 16
You will see a form:

- **Title:** Type a name like `MacBook Air` (or any name you like).
- **Key type:** Leave as **Authentication Key**.
- **Key:** Click in the big text box and press **Cmd + V** to paste the line you copied in Step 8.

---

### Step 17
Click **"Add SSH key"**.

- You may need to enter your GitHub password to confirm.
- When you see the new key listed, Part 3 is done. Go to Part 4.

---

## Part 4: Push your project to GitHub using SSH

### Step 18
Open **Terminal** again (or use the same window).

---

### Step 19
Go to your project folder. Type this and press **Enter**:

```
cd /Users/vakatirutvijreddy/Projects/Data_Sense_AI_Chatbot-main
```

---

### Step 20
Tell Git to use SSH instead of HTTPS. Type this and press **Enter**:

```
git remote set-url origin git@github.com:rutvij1407/Data_Sense_AI_Chatbot.git
```

---

### Step 21
Push your code to GitHub. Type this and press **Enter**:

```
git push -u origin main
```

---

### Step 22
The first time you push, it may ask: **"Are you sure you want to continue connecting?"**

- Type **yes** and press **Enter**.

---

### Step 23
If you set a passphrase in Step 4, it will ask for your **SSH key passphrase**.

- Type it (nothing will show as you type) and press **Enter**.

---

### Step 24
You should see something like: **"Branch 'main' set up to track remote branch 'main' from 'origin'."** and a list of files being pushed.

- **Done.** Your code is now on GitHub.

---

## Quick reference – commands in order

If you have already done Part 1 and Part 3, you only need these in Terminal:

```
cd /Users/vakatirutvijreddy/Projects/Data_Sense_AI_Chatbot-main
git remote set-url origin git@github.com:rutvij1407/Data_Sense_AI_Chatbot.git
git push -u origin main
```

---

## If something goes wrong

| Problem | What to do |
|--------|------------|
| "Permission denied (publickey)" | Make sure you added the **SSH key** (Part 3), not a GPG key. Use the **SSH keys** tab. |
| "Could not resolve hostname" | Check your internet connection. |
| "repository not found" | Check the repo name is `Data_Sense_AI_Chatbot` and your username is `rutvij1407`. |
| "nothing to commit" | Your code is already pushed. Run `git status` to confirm. |
