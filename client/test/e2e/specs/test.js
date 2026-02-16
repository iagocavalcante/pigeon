// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
  'default e2e tests': function (browser) {
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer)
      .waitForElementVisible('#app', 5000)
      .assert.elementPresent('.hello')
      .assert.containsText('h1', 'Welcome to Your Vue.js PWA')
      .assert.elementCount('img', 1)
      .end()
  },

  'homepage has correct title': function (browser) {
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer)
      .waitForElementVisible('#app', 5000)
      .assert.titleContains('Pigeon')
      .end()
  },

  'app loads without errors': function (browser) {
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer)
      .waitForElementVisible('#app', 5000)
      .getLog(function (logs) {
        // Check for critical errors only
        const errors = logs.filter(log => log.level === 'SEVERE')
        this.assert.equal(errors.length, 0, 'No critical console errors')
      })
      .end()
  },

  'login page accessibility': function (browser) {
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer + '/login')
      .waitForElementVisible('#app', 5000)
      .assert.elementPresent('input[type="email"]')
      .assert.elementPresent('input[type="password"]')
      .assert.elementPresent('button[type="submit"]')
      .end()
  },

  'navigation links present': function (browser) {
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer)
      .waitForElementVisible('#app', 5000)
      .elements('css selector', 'nav', function (result) {
        this.assert.ok(result.value.length > 0, 'Navigation bar exists')
      })
      .end()
  },

  'footer exists': function (browser) {
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer)
      .waitForElementVisible('#app', 5000)
      .assert.elementPresent('footer')
      .end()
  },

  'email list page loads': function (browser) {
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer + '/email')
      .waitForElementVisible('#app', 5000)
      .assert.elementPresent('#app')
      .end()
  },

  'lists page loads': function (browser) {
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer + '/lists')
      .waitForElementVisible('#app', 5000)
      .assert.elementPresent('#app')
      .end()
  },

  'new email page loads': function (browser) {
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer + '/email/new')
      .waitForElementVisible('#app', 5000)
      .assert.elementPresent('#app')
      .end()
  },

  'responsive layout works': function (browser) {
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer)
      .waitForElementVisible('#app', 5000)
      .resizeWindow(375, 667) // Mobile size
      .waitForElementVisible('#app', 5000)
      .assert.elementPresent('#app')
      .resizeWindow(1920, 1080) // Desktop size
      .waitForElementVisible('#app', 5000)
      .end()
  },

  'page loads within reasonable time': function (browser) {
    const devServer = browser.globals.devServerURL
    const startTime = Date.now()

    browser
      .url(devServer)
      .waitForElementVisible('#app', 10000)
      .perform(function () {
        const loadTime = Date.now() - startTime
        browser.assert.ok(loadTime < 5000, 'Page loads in less than 5 seconds: ' + loadTime + 'ms')
      })
      .end()
  }
}
