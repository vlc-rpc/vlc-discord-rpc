import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress/cli'
import { viteBundler } from '@vuepress/bundler-vite'
import { openGraphPlugin } from 'vuepress-plugin-open-graph';

export default defineUserConfig({
  lang: 'en-US',
  base: "/vlc-discord-rpc/",

  title: 'VLC-RPC',
  description: 'An updated Discord rich presence for VLC media player',
  head: [['link', { rel: 'icon', href: './images/image.png' }]],

  plugins: [
    openGraphPlugin({
      host: "https://vlc-rpc.github.io/vlc-discord-rpc/",
      defaultImage: "./images/image.png"
    }),
  ],

  theme: defaultTheme({
    logo: './images/image.png',

    navbar: [      
    { text: 'Home', link: '/' },
    { text: 'Setup', link: '/setup.html' },
    { text: 'Detached State', link: '/detached.html' },
    { text: 'Custom Images', link: '/custom-images.html' },
    { text: 'Shows and Movies', link: '/shows-and-movies.html'},
    { text: 'Support', link: '/support.html' }
  ],
  sidebar: [      
    { text: 'Home', link: '/' },
    { text: 'Setup', link: '/setup.html' },
    { text: 'Detached State', link: '/detached.html', children: [] },
    { text: 'Custom Images', link: '/custom-images.html', collapsible: true },
    { 
      text: 'Shows and Movies',
      link: '/shows-and-movies.html',
      collapsible: true,
      children: [{text: "File by file", link: "#option-1"}, {text: "Using folders", link: "#option-2"}, {text: "Automatically with shows/movies folder", link: "#option-3"}]},
      { text: 'Support', link: '/support.html' },
    ],
  
  }),

  bundler: viteBundler(),
})
