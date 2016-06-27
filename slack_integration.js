function SlackAPI(config) {
  this.webhookUrl = config.webhookUrl;

  // Send a message to slack. The config can 
  // be as simple as a string or an object
  // for passing more complex messages.
  this.sendMessage = function(config) {
    if(typeof config == 'object') {
      postToSlack(this.webhookUrl, config);
    } else {
      postToSlack(this.webhookUrl, { text : config });
    }
  };
  
  // Take care of all the messy stuff like
  // retries and status codes.
  function postToSlack(url, payload) {
    var options = {
      method: 'POST',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    var retries = 3;
    while(retries > 0) {
      try {
        var resp = UrlFetchApp.fetch(url,options);
        if(resp.getResponseCode() == 200) {
          return true;
        } else {
          Logger.log(
            Utilities.formatString(
              "WARNING: Slack returned status code of %s and a message of: %s",
              resp.getResponseCode(),
              resp.getContentText()
            )
          );
          Logger.log('Waiting 1 seconds then retrying...');
          Utilities.sleep(1000);
          retries--;
        }
      } catch(e) {
        Logger.log("ERROR: Something failed in UrlFetchApp. Retrying in 1 second...");
        Utilities.sleep(1000);
        retries--;
      }
    }
    throw "Either UrlFetchApp is broken or the Slack Webhook is not configured properly.";
  }
};

/**SIMPLE MESSAGE********************/

function main() {
  var slack = new SlackAPI({
    webhookUrl : "https://hooks.slack.com/services/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" 
  });
  slack.sendMessage('This is a test');
  slack.sendMessage({
    channel: "#dea-area51", 
    username: "cronjob-bot", 
    text: "test", 
    icon_emoji: ":andy-one:"
  });
}
