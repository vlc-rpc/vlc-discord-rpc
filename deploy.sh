set -e

npm i
npm run docs:build

cd docs/.vuepress/dist

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:vlc-rpc/vlc-discord-rpc.git master:gh-pages

cd -
