# Installation Guide - Quick Reference

This is a quick reference for installing all the tools you'll need. **Detailed step-by-step instructions are provided in the appropriate weeks.**

## Tools You'll Need

1. **VS Code** - Code editor (install in Week 1)
2. **Node.js** (includes npm) - For running JavaScript and managing packages (install in Week 2)
3. **Git** - For version control and deployment (install in Week 2)
4. **VS Code Extensions** - Helpful add-ons (install in Week 1)

## When to Install

- **Week 1, Day 1**: Install VS Code and extensions (detailed instructions in `week-01/README.md`)
- **Week 2, Day 3-5**: Install Node.js, npm, and Git (detailed instructions in `week-02/README.md`)

## Quick Links

### VS Code (Install in Week 1)
- **Website**: [code.visualstudio.com](https://code.visualstudio.com/)
- **For Windows**: Download the Windows installer
- **When**: Week 1, Day 1
- **Verify**: VS Code should open when you run the installer
- **Detailed Instructions**: See `week-01/README.md`

### Node.js (Install in Week 2)
- **Website**: [nodejs.org](https://nodejs.org/)
- **Download**: Click the LTS (Long Term Support) version
- **For Windows**: Download the .msi installer
- **When**: Week 2, Day 3-5
- **Verify**: Open Command Prompt and type `node --version`
- **Detailed Instructions**: See `week-02/README.md`

### Git (Install in Week 2)
- **Website**: [git-scm.com/download/win](https://git-scm.com/download/win)
- **For Windows**: Download will start automatically
- **When**: Week 2, Day 3-5
- **Verify**: Open Command Prompt and type `git --version`
- **Detailed Instructions**: See `week-02/README.md`

### VS Code Extensions (install after VS Code is installed)
1. Open VS Code
2. Click Extensions icon (left sidebar, or press `Ctrl+Shift+X`)
3. Search and install:
   - **ESLint** (by Microsoft)
   - **Prettier - Code formatter** (by Prettier)
   - **Live Server** (by Ritwick Dey) - optional

## Verification Checklist

After installation, verify everything works:

```bash
# Open Command Prompt (Windows) or Terminal (Mac/Linux)
# Type each command and press Enter:

node --version    # Should show: v20.x.x or similar
npm --version     # Should show: 10.x.x or similar
git --version     # Should show: git version 2.x.x
```

## Troubleshooting

**Commands not found?**
- Restart your computer after installation
- Make sure "Add to PATH" was checked during Node.js installation
- Try reinstalling if needed

**VS Code won't open?**
- Make sure you downloaded the correct version for your system
- Try running as administrator (right-click → Run as administrator)

**Need more help?**
- See detailed instructions in `week-02/README.md`
- Each tool has troubleshooting tips in the Week 2 guide

## Next Steps

**Week 1:**
1. Install VS Code (see `week-01/README.md`)
2. Install Live Server extension
3. Start building HTML/CSS/JavaScript projects

**Week 2:**
1. Install Node.js, npm, and Git (see `week-02/README.md`)
2. Follow the step-by-step guide to create your first React project
3. You'll create a project called "my-favorite-places"
4. Run `npm run dev` to see it working!

---

**Remember**: Don't worry if installation seems complicated. Take your time, follow the steps in Week 2, and ask for help if you get stuck!

