import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import ContributorProfile from './components/ContributorProfile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to truncate text with ellipsis
const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
};

const ContributorComponentsScript = `
const GithubIcon = () => 
  React.createElement('svg', {
    className: 'w-5 h-5',
    viewBox: '0 0 24 24',
    fill: 'currentColor'
  }, 
    React.createElement('path', {
      d: 'M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12'
    })
  );

const StatusDot = ({ status }) => {
  const colors = {
    open: 'bg-green-500',
    closed: 'bg-red-500',
    merged: 'bg-purple-500'
  };

  return React.createElement('span', {
    className: \`inline-block w-2 h-2 rounded-full \${colors[status]} mr-2\`
  });
};

const ActivitySection = ({ title, items = [], showStatus = false }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  const getStatus = (item) => {
    if (item.state === 'merged' || (item.state === 'closed' && title === 'Pull Requests')) {
      return 'merged';
    }
    return item.state || 'open';
  };

  return React.createElement('div', { className: 'border rounded-lg p-4' },
    React.createElement('div', {
      className: 'flex items-center justify-between cursor-pointer',
      onClick: () => setIsExpanded(!isExpanded)
    },
      React.createElement('h3', { className: 'font-semibold' }, title),
      React.createElement('span', null, isExpanded ? '▼' : '▶')
    ),
    isExpanded && React.createElement('div', { className: 'mt-4 space-y-2' },
      items.map((item, index) => 
        React.createElement('div', { 
          key: index, 
          className: 'p-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition duration-150'
        },
          React.createElement('a', {
            href: item.url,
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'text-sm hover:text-blue-500 flex flex-col gap-1 group'
          },
            React.createElement('span', { 
              className: 'font-medium flex items-center justify-between'
            },
              React.createElement('span', {
                className: 'flex items-center'
              },
                showStatus && React.createElement(StatusDot, { status: getStatus(item) }),
                item.message || item.title || item.body
              ),
              React.createElement(GithubIcon, {
                className: 'opacity-0 group-hover:opacity-100 transition-opacity'
              })
            ),
            React.createElement('span', { 
              className: 'text-gray-500 text-xs flex items-center justify-between'
            },
              React.createElement('span', null,
                new Date(item.date || item.created_at).toLocaleDateString()
              ),
              React.createElement('span', {
                className: 'text-gray-400'
              }, 'View on GitHub →')
            )
          )
        )
      )
    )
  );
};

const StatCard = ({ name, value, url }) => {
  return React.createElement('div', {
    className: 'bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer',
    onClick: () => window.open(url, '_blank')
  },
    React.createElement('h3', { className: 'font-semibold text-gray-600 dark:text-gray-400' }, name),
    React.createElement('p', { className: 'text-2xl font-bold' }, value)
  );
};

const ContributorProfile = ({ data }) => {
  const githubProfileUrl = \`https://github.com/\${data.contributor}\`;
  const stats = [
    { 
      name: 'Commits', 
      value: data.activity.code.total_commits,
      url: \`\${githubProfileUrl}?tab=repositories\`
    },
    { 
      name: 'Pull Requests', 
      value: data.activity.code.total_prs,
      url: \`\${githubProfileUrl}?tab=pull-requests\`
    },
    { 
      name: 'Issues', 
      value: data.activity.issues.total_opened,
      url: \`\${githubProfileUrl}?tab=issues\`
    },
    { 
      name: 'Comments', 
      value: data.activity.engagement.total_comments,
      url: \`\${githubProfileUrl}?tab=discussions\`
    }
  ];

  return React.createElement('div', { className: 'max-w-7xl mx-auto p-4 space-y-6' },
    React.createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-lg p-6 shadow' },
      React.createElement('div', { className: 'flex items-center justify-between' },
        React.createElement('div', { className: 'flex items-center gap-4' },
          React.createElement('a', {
            href: githubProfileUrl,
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'group relative'
          },
            React.createElement('img', {
              src: data.avatar_url,
              alt: \`\${data.contributor}'s avatar\`,
              className: 'w-16 h-16 rounded-full ring-2 ring-transparent group-hover:ring-blue-500 transition-all duration-200'
            }),
            React.createElement(GithubIcon, {
              className: 'absolute bottom-0 right-0 text-gray-700 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity'
            })
          ),
          React.createElement('div', null,
            React.createElement('a', {
              href: githubProfileUrl,
              target: '_blank',
              rel: 'noopener noreferrer',
              className: 'flex items-center gap-2 group'
            },
              React.createElement('h1', { 
                className: 'text-2xl font-bold group-hover:text-blue-500 transition-colors'
              }, data.contributor),
              React.createElement(GithubIcon, {
                className: 'opacity-0 group-hover:opacity-100 transition-opacity'
              })
            ),
            React.createElement('div', { className: 'text-gray-600 dark:text-gray-400' },
              React.createElement('span', { className: 'font-semibold' }, 'Contribution Score: '),
              data.score
            )
          )
        )
      )
    ),

    data.summary && React.createElement('div', { 
      className: 'bg-white dark:bg-gray-800 rounded-lg p-6 shadow'
    },
      React.createElement('p', { 
        className: 'text-gray-700 dark:text-gray-300 text-sm leading-relaxed'
      }, data.summary)
    ),

    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-4' },
      stats.map(stat => React.createElement(StatCard, { 
        key: stat.name,
        ...stat
      }))
    ),

    React.createElement('div', { className: 'space-y-4' },
      React.createElement(ActivitySection, {
        title: 'Commits',
        items: data.activity.code.commits
      }),
      React.createElement(ActivitySection, {
        title: 'Pull Requests',
        items: data.activity.code.pull_requests,
        showStatus: true
      }),
      React.createElement(ActivitySection, {
        title: 'Issues',
        items: data.activity.issues.opened || [],
        showStatus: true
      }),
      React.createElement(ActivitySection, {
        title: 'Comments',
        items: data.activity.engagement.comments
      })
    )
  );
};

// Initialize React root and render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(ContributorProfile, { data: window.__DATA__ }));`;

const template = (content, data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.contributor} - GitHub Contributions</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.3.0/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50 dark:bg-gray-900">
    <div id="root">${content}</div>
    <script>
        window.__DATA__ = ${JSON.stringify(data)};
    </script>
    <script type="text/javascript">
        ${ContributorComponentsScript}
    </script>
</body>
</html>`;

const generateSite = async () => {
    const inputDir = path.join(path.dirname(__dirname), 'data');
    const outputDir = path.join(path.dirname(__dirname), 'profiles');

    try {
        await fs.mkdir(outputDir, { recursive: true });
        
        // Read contributors.json
        const contributorsData = JSON.parse(
            await fs.readFile(path.join(inputDir, 'contributors.json'), 'utf-8')
        );

        // Generate individual profile pages
        for (const data of contributorsData) {
            const content = renderToString(
                React.createElement(ContributorProfile, { data })
            );
            
            const html = template(content, data);
            
            await fs.writeFile(
                path.join(outputDir, `${data.contributor}.html`),
                html
            );
            
            console.log(`Generated profile for ${data.contributor}`);
        }

        // Generate index.html with improved card design
        const indexContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitHub Contributors</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.3.0/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto p-8">
        <h1 class="text-3xl font-bold mb-8 text-gray-900 dark:text-white">GitHub Contributors</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${contributorsData.map(data => `
                <a href="${data.contributor}.html" 
                   class="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-200 relative group">
                    <div class="absolute top-4 right-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-semibold">
                        Score: ${data.score}
                    </div>
                    <div class="flex items-center gap-4 mb-4">
                        <div class="relative">
                            <img src="${data.avatar_url}" 
                                 alt="${data.contributor}" 
                                 class="w-12 h-12 rounded-full ring-2 ring-transparent group-hover:ring-blue-500 transition-all duration-200">
                        </div>
                        <div>
                            <h2 class="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                                ${data.contributor}
                            </h2>
                            <p class="text-gray-600 dark:text-gray-400">
                                ${data.activity.code.total_commits} commits
                            </p>
                        </div>
                    </div>
                    ${data.summary ? `
                        <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            ${truncateText(data.summary, 140)}
                        </p>
                    ` : ''}
                    <div class="mt-4 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>${data.activity.code.total_commits} commits</span>
                        <span>${data.activity.code.total_prs} PRs</span>
                        <span>${data.activity.issues.total_opened} issues</span>
                    </div>
                </a>
            `).join('')}
        </div>
    </div>
</body>
</html>`;

        await fs.writeFile(path.join(outputDir, 'index.html'), indexContent);

        console.log('Site generation complete! Open ./profiles/index.html to view the result.');
    } catch (error) {
        console.error('Error generating site:', error);
        console.error(error.stack);
    }
};

generateSite();
