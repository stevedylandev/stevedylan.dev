#!/bin/bash
echo "

 ██████  ███████ ███    ██ ███████ ███████ ██ ███████
██       ██      ████   ██ ██      ██      ██ ██
██   ███ █████   ██ ██  ██ █████   ███████ ██ ███████
██    ██ ██      ██  ██ ██ ██           ██ ██      ██
 ██████  ███████ ██   ████ ███████ ███████ ██ ███████


Where building on Ethereum begins

https://github.com/stevedylandev/genesis

"

echo "❯ Do you want to install Foundry? (Y/n)"
read install_foundry

if [[ $install_foundry =~ ^[Nn]$ ]]; then
    echo "Skipping Foundry installation..."
else
    printf "Installing Foundry..."
    curl -fsS https://foundry.paradigm.xyz | bash > /dev/null 2>&1

    foundryup > /dev/null 2>&1

    printf "\r✔️ Foundry installed    \n"
fi

echo "❯ Do you want to install Helios? (Y/n)"
read -n 1 install_helios
echo

if [[ $install_helios =~ ^[Nn]$ ]]; then
    echo "Skipping Helios installation..."
else
    printf "Installing Helios..."
    curl -fsS https://raw.githubusercontent.com/a16z/helios/master/heliosup/install | bash > /dev/null 2>&1

    # Install helios
    heliosup > /dev/null 2>&1

    printf "\r✔️ Helios installed    \n"
fi

echo "❯ Do you want to install Hardhat? (Y/n)"
read -n 1 install_hardhat
echo

if [[ $install_hardhat =~ ^[Nn]$ ]]; then
    echo "Skipping Hardhat installation..."
else
    printf "Installing Hardhat..."
    if command -v pnpm >/dev/null 2>&1; then
        pnpm install -g hardhat > /dev/null 2>&1
    elif command -v npm >/dev/null 2>&1; then
        npm install -g hardhat > /dev/null 2>&1
    elif command -v bun >/dev/null 2>&1; then
        bun install -g hardhat > /dev/null 2>&1
    else
        printf "\rNo package manager found (pnpm, npm, or bun)\n"
        exit 1
    fi
    printf "\r✔️ HardHat installed    \n"
fi

echo "❯ Do you want to install Solc? (Y/n)"
read -n 1 install_solc
echo

if [[ $install_solc =~ ^[Nn]$ ]]; then
    echo "Skipping Solc installation..."
else
    printf "Installing Solc..."
    if command -v npm >/dev/null 2>&1; then
        npm install --global solc > /dev/null 2>&1
    else
        printf "\rNpm not found\n"
        exit 1
    fi
    printf "\r✔️ Solc installed    \n"
fi


echo "❯ Do you want to create a new wallet? (Y/n)"
read -n 1 create_wallet
echo

if [[ $create_wallet =~ ^[Nn]$ ]]; then
    echo "Skipping wallet creation..."
else
    echo "❯ What do you want to name your wallet?"
    read wallet_name
    cast wallet new --password ~/.foundry/keystores $wallet_name
fi

echo "
✔️ Installation complete!

Start a new project with 'forge init counter'
"
