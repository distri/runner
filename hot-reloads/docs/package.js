(function(pkg) {
  (function() {
  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, rootModule, startsWith,
    __slice = [].slice;

  fileSeparator = '/';

  global = window;

  defaultEntryPoint = "main";

  circularGuard = {};

  rootModule = {
    path: ""
  };

  loadPath = function(parentModule, pkg, path) {
    var cache, localPath, module, normalizedPath;
    if (startsWith(path, '/')) {
      localPath = [];
    } else {
      localPath = parentModule.path.split(fileSeparator);
    }
    normalizedPath = normalizePath(path, localPath);
    cache = cacheFor(pkg);
    if (module = cache[normalizedPath]) {
      if (module === circularGuard) {
        throw "Circular dependency detected when requiring " + normalizedPath;
      }
    } else {
      cache[normalizedPath] = circularGuard;
      try {
        cache[normalizedPath] = module = loadModule(pkg, normalizedPath);
      } finally {
        if (cache[normalizedPath] === circularGuard) {
          delete cache[normalizedPath];
        }
      }
    }
    return module.exports;
  };

  normalizePath = function(path, base) {
    var piece, result;
    if (base == null) {
      base = [];
    }
    base = base.concat(path.split(fileSeparator));
    result = [];
    while (base.length) {
      switch (piece = base.shift()) {
        case "..":
          result.pop();
          break;
        case "":
        case ".":
          break;
        default:
          result.push(piece);
      }
    }
    return result.join(fileSeparator);
  };

  loadPackage = function(pkg) {
    var path;
    path = pkg.entryPoint || defaultEntryPoint;
    return loadPath(rootModule, pkg, path);
  };

  loadModule = function(pkg, path) {
    var args, context, dirname, file, module, program, values;
    if (!(file = pkg.distribution[path])) {
      throw "Could not find file at " + path + " in " + pkg.name;
    }
    program = annotateSourceURL(file.content, pkg, path);
    dirname = path.split(fileSeparator).slice(0, -1).join(fileSeparator);
    module = {
      path: dirname,
      exports: {}
    };
    context = {
      require: generateRequireFn(pkg, module),
      global: global,
      module: module,
      exports: module.exports,
      PACKAGE: pkg,
      __filename: path,
      __dirname: dirname
    };
    args = Object.keys(context);
    values = args.map(function(name) {
      return context[name];
    });
    Function.apply(null, __slice.call(args).concat([program])).apply(module, values);
    return module;
  };

  isPackage = function(path) {
    if (!(startsWith(path, fileSeparator) || startsWith(path, "." + fileSeparator) || startsWith(path, ".." + fileSeparator))) {
      return path.split(fileSeparator)[0];
    } else {
      return false;
    }
  };

  generateRequireFn = function(pkg, module) {
    if (module == null) {
      module = rootModule;
    }
    if (pkg.name == null) {
      pkg.name = "ROOT";
    }
    if (pkg.scopedName == null) {
      pkg.scopedName = "ROOT";
    }
    return function(path) {
      var otherPackage;
      if (isPackage(path)) {
        if (!(otherPackage = pkg.dependencies[path])) {
          throw "Package: " + path + " not found.";
        }
        if (otherPackage.name == null) {
          otherPackage.name = path;
        }
        if (otherPackage.scopedName == null) {
          otherPackage.scopedName = "" + pkg.scopedName + ":" + path;
        }
        return loadPackage(otherPackage);
      } else {
        return loadPath(module, pkg, path);
      }
    };
  };

  if (typeof exports !== "undefined" && exports !== null) {
    exports.generateFor = generateRequireFn;
  } else {
    global.Require = {
      generateFor: generateRequireFn
    };
  }

  startsWith = function(string, prefix) {
    return string.lastIndexOf(prefix, 0) === 0;
  };

  cacheFor = function(pkg) {
    if (pkg.cache) {
      return pkg.cache;
    }
    Object.defineProperty(pkg, "cache", {
      value: {}
    });
    return pkg.cache;
  };

  annotateSourceURL = function(program, pkg, path) {
    return "" + program + "\n//# sourceURL=" + pkg.scopedName + "/" + path;
  };

}).call(this);

//# sourceURL=main.coffee
  window.require = Require.generateFor(pkg);
})({
  "source": {
    "LICENSE": {
      "path": "LICENSE",
      "mode": "100644",
      "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
      "type": "blob"
    },
    "README.md": {
      "path": "README.md",
      "mode": "100644",
      "content": "runner\n======\n\nRunner manages running apps in sandboxed windows and passing messages back and forth from the parent to the running instances.\n",
      "type": "blob"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "mode": "100644",
      "content": "version: \"0.2.0\"\nentryPoint: \"runner\"\n",
      "type": "blob"
    },
    "runner.coffee.md": {
      "path": "runner.coffee.md",
      "mode": "100644",
      "content": "Runner\n======\n\nRunner manages running apps in sandboxed windows and passing messages back and\nforth from the parent to the running instances.\n\nWe keep a list of running windows so we can hot-update them when we modify our\nown code.\n\nOne cool example use is if you are modifying your css you can run several\ninstances of your app and navigate to different states. Then you can see in real\ntime how the css changes affect each one.\n\n    runningWindows = []\n\n    Runner = ->\n      run: ({config}={}) ->\n        {width, height} = (config or {})\n\n        sandbox = Sandbox\n          width: width\n          height: height\n\n        runningWindows.push sandbox\n\n        return sandbox\n\nGenerate an html template that runs the given script tag strings as tests.\n\n      testsHtml: (testScripts) ->\n        \"\"\"\n          <html>\n          <head>\n            <meta charset=\"utf-8\">\n            <title>Mocha Tests</title>\n            <link rel=\"stylesheet\" href=\"http://strd6.github.io/tests/mocha.css\"/>\n          </head>\n          <body>\n            <div id=\"mocha\"></div>\n            <script src=\"http://strd6.github.io/tests/assert.js\"><\\/script>\n            <script src=\"http://strd6.github.io/tests/mocha.js\"><\\/script>\n            <script>mocha.setup('bdd')<\\/script>\n            #{testScripts}\n            <script>\n              mocha.checkLeaks();\n              mocha.globals(['jQuery']);\n              mocha.run();\n            <\\/script>\n          </body>\n          </html>\n        \"\"\"\n\n      hotReloadCSS: (css) ->\n        runningWindows = runningWindows.select (window) ->\n          return false if window.closed\n\n          # TODO: We're assuming only one style in the body\n          # which is reasonable in most cases, but we may want\n          # to scope it by the path of the specific css file\n          # to handle a wider range of situations\n          $(window.document).find(\"body style:eq(0)\").html(css)\n\n          return true\n\nCall a global reload method on each running window, passing in the given data.\nWe may want to switch to using `postMessage` in the future.\n\n      reload: (data) ->\n        runningWindows = runningWindows.select (window) ->\n          return false if window.closed\n\n          window.reload?(data)\n\n          return true\n\n    module.exports = Runner\n",
      "type": "blob"
    }
  },
  "distribution": {
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"version\":\"0.2.0\",\"entryPoint\":\"runner\"};",
      "type": "blob"
    },
    "runner": {
      "path": "runner",
      "content": "(function() {\n  var Runner, runningWindows;\n\n  runningWindows = [];\n\n  Runner = function() {\n    return {\n      run: function(_arg) {\n        var config, height, sandbox, width, _ref;\n        config = (_arg != null ? _arg : {}).config;\n        _ref = config || {}, width = _ref.width, height = _ref.height;\n        sandbox = Sandbox({\n          width: width,\n          height: height\n        });\n        runningWindows.push(sandbox);\n        return sandbox;\n      },\n      testsHtml: function(testScripts) {\n        return \"<html>\\n<head>\\n  <meta charset=\\\"utf-8\\\">\\n  <title>Mocha Tests</title>\\n  <link rel=\\\"stylesheet\\\" href=\\\"http://strd6.github.io/tests/mocha.css\\\"/>\\n</head>\\n<body>\\n  <div id=\\\"mocha\\\"></div>\\n  <script src=\\\"http://strd6.github.io/tests/assert.js\\\"><\\/script>\\n  <script src=\\\"http://strd6.github.io/tests/mocha.js\\\"><\\/script>\\n  <script>mocha.setup('bdd')<\\/script>\\n  \" + testScripts + \"\\n  <script>\\n    mocha.checkLeaks();\\n    mocha.globals(['jQuery']);\\n    mocha.run();\\n  <\\/script>\\n</body>\\n</html>\";\n      },\n      hotReloadCSS: function(css) {\n        return runningWindows = runningWindows.select(function(window) {\n          if (window.closed) {\n            return false;\n          }\n          $(window.document).find(\"body style:eq(0)\").html(css);\n          return true;\n        });\n      },\n      reload: function(data) {\n        return runningWindows = runningWindows.select(function(window) {\n          if (window.closed) {\n            return false;\n          }\n          if (typeof window.reload === \"function\") {\n            window.reload(data);\n          }\n          return true;\n        });\n      }\n    };\n  };\n\n  module.exports = Runner;\n\n}).call(this);\n",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "http://strd6.github.io/editor/"
  },
  "version": "0.2.0",
  "entryPoint": "runner",
  "repository": {
    "id": 13482507,
    "name": "runner",
    "full_name": "STRd6/runner",
    "owner": {
      "login": "STRd6",
      "id": 18894,
      "avatar_url": "https://avatars.githubusercontent.com/u/18894?",
      "gravatar_id": "33117162fff8a9cf50544a604f60c045",
      "url": "https://api.github.com/users/STRd6",
      "html_url": "https://github.com/STRd6",
      "followers_url": "https://api.github.com/users/STRd6/followers",
      "following_url": "https://api.github.com/users/STRd6/following{/other_user}",
      "gists_url": "https://api.github.com/users/STRd6/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/STRd6/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/STRd6/subscriptions",
      "organizations_url": "https://api.github.com/users/STRd6/orgs",
      "repos_url": "https://api.github.com/users/STRd6/repos",
      "events_url": "https://api.github.com/users/STRd6/events{/privacy}",
      "received_events_url": "https://api.github.com/users/STRd6/received_events",
      "type": "User",
      "site_admin": false
    },
    "private": false,
    "html_url": "https://github.com/STRd6/runner",
    "description": "Runner manages running apps in sandboxed windows and passing messages back and forth from the parent to the running instances.",
    "fork": false,
    "url": "https://api.github.com/repos/STRd6/runner",
    "forks_url": "https://api.github.com/repos/STRd6/runner/forks",
    "keys_url": "https://api.github.com/repos/STRd6/runner/keys{/key_id}",
    "collaborators_url": "https://api.github.com/repos/STRd6/runner/collaborators{/collaborator}",
    "teams_url": "https://api.github.com/repos/STRd6/runner/teams",
    "hooks_url": "https://api.github.com/repos/STRd6/runner/hooks",
    "issue_events_url": "https://api.github.com/repos/STRd6/runner/issues/events{/number}",
    "events_url": "https://api.github.com/repos/STRd6/runner/events",
    "assignees_url": "https://api.github.com/repos/STRd6/runner/assignees{/user}",
    "branches_url": "https://api.github.com/repos/STRd6/runner/branches{/branch}",
    "tags_url": "https://api.github.com/repos/STRd6/runner/tags",
    "blobs_url": "https://api.github.com/repos/STRd6/runner/git/blobs{/sha}",
    "git_tags_url": "https://api.github.com/repos/STRd6/runner/git/tags{/sha}",
    "git_refs_url": "https://api.github.com/repos/STRd6/runner/git/refs{/sha}",
    "trees_url": "https://api.github.com/repos/STRd6/runner/git/trees{/sha}",
    "statuses_url": "https://api.github.com/repos/STRd6/runner/statuses/{sha}",
    "languages_url": "https://api.github.com/repos/STRd6/runner/languages",
    "stargazers_url": "https://api.github.com/repos/STRd6/runner/stargazers",
    "contributors_url": "https://api.github.com/repos/STRd6/runner/contributors",
    "subscribers_url": "https://api.github.com/repos/STRd6/runner/subscribers",
    "subscription_url": "https://api.github.com/repos/STRd6/runner/subscription",
    "commits_url": "https://api.github.com/repos/STRd6/runner/commits{/sha}",
    "git_commits_url": "https://api.github.com/repos/STRd6/runner/git/commits{/sha}",
    "comments_url": "https://api.github.com/repos/STRd6/runner/comments{/number}",
    "issue_comment_url": "https://api.github.com/repos/STRd6/runner/issues/comments/{number}",
    "contents_url": "https://api.github.com/repos/STRd6/runner/contents/{+path}",
    "compare_url": "https://api.github.com/repos/STRd6/runner/compare/{base}...{head}",
    "merges_url": "https://api.github.com/repos/STRd6/runner/merges",
    "archive_url": "https://api.github.com/repos/STRd6/runner/{archive_format}{/ref}",
    "downloads_url": "https://api.github.com/repos/STRd6/runner/downloads",
    "issues_url": "https://api.github.com/repos/STRd6/runner/issues{/number}",
    "pulls_url": "https://api.github.com/repos/STRd6/runner/pulls{/number}",
    "milestones_url": "https://api.github.com/repos/STRd6/runner/milestones{/number}",
    "notifications_url": "https://api.github.com/repos/STRd6/runner/notifications{?since,all,participating}",
    "labels_url": "https://api.github.com/repos/STRd6/runner/labels{/name}",
    "releases_url": "https://api.github.com/repos/STRd6/runner/releases{/id}",
    "created_at": "2013-10-10T20:42:25Z",
    "updated_at": "2013-11-29T20:25:11Z",
    "pushed_at": "2013-11-29T20:25:11Z",
    "git_url": "git://github.com/STRd6/runner.git",
    "ssh_url": "git@github.com:STRd6/runner.git",
    "clone_url": "https://github.com/STRd6/runner.git",
    "svn_url": "https://github.com/STRd6/runner",
    "homepage": null,
    "size": 156,
    "stargazers_count": 0,
    "watchers_count": 0,
    "language": "CoffeeScript",
    "has_issues": true,
    "has_downloads": true,
    "has_wiki": true,
    "forks_count": 0,
    "mirror_url": null,
    "open_issues_count": 0,
    "forks": 0,
    "open_issues": 0,
    "watchers": 0,
    "default_branch": "master",
    "master_branch": "master",
    "permissions": {
      "admin": true,
      "push": true,
      "pull": true
    },
    "network_count": 0,
    "subscribers_count": 1,
    "branch": "hot-reloads",
    "publishBranch": "gh-pages"
  },
  "dependencies": {}
});