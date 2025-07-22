import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Simone - AI Project Management',
  tagline: 'A framework for AI-assisted software development',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://helmi.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/claude-simone/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'helmi', // Usually your GitHub org/user name.
  projectName: 'claude-simone', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: './',
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          exclude: [
            '**/node_modules/**',
            '**/.docusaurus/**',
            '**/build/**',
          ],
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/helmi/claude-simone/tree/main/',
          
        },
        blog: false, // Disable the blog plugin
        pages: false, // Disable the pages plugin
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  

  themeConfig: {
    announcementBar: {
      id: 'work_in_progress',
      content:
        '🚧 **This documentation is a work in progress.** Information may be incomplete or inaccurate. For feedback, please visit the <a target="_blank" rel="noopener noreferrer" href="https://github.com/helmi/claude-simone">GitHub repository</a>. 🚧',
      backgroundColor: '#fffbdd',
      textColor: '#665400',
      isCloseable: true,
    },
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Simone',
      logo: {
        alt: 'Simone Logo',
        src: 'img/simone-icon-only.svg',
      },
      items: [
        {
          href: 'https://github.com/helmi/claude-simone',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: '/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Issues',
              href: 'https://github.com/helmi/claude-simone/issues',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Helmi. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;