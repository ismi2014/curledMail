const hogan = require('hogan.js'),
  emailjs = require('emailjs'),
  html2text = require('./html2text.js');

// compile templates in a object
function getCompiledObj(obj) {
  let fns = {};
  for (let i in obj) {
    fns[i] = hogan.compile(obj[i]);
  }
  return fns;
};

// compile templates in objects in an array
function getCompiledArr(arr) {
  return arr.map( function (el) {
    return getCompiledObj(el);
  });
};

// message template
class Template {
  constructor(template) {
    if (template.attachments) {
      this.attachments = getCompiledArr(template.attachments);
    } else {
      this.attachments = [];
    }

    this.src = template;
    this.compiled = getCompiledObj(this.src);
  }

  render(data) {
    let msg = {};

    for (let i in this.src) {
      msg[i] = this.compiled[i].render(data);
    }

    msg.attachment = [];

    this.attachments.forEach((att) => {
      let rendered = {};
      for (let i in att) {
        rendered[i] = att[i].render(data);
      }

      msg.attachment.push(rendered);
    });

    if (!msg.attachments) {
      msg.attachments = [];
    }

    //attach html message
    if (msg.html) {
      msg.attachments.push({
        data: msg.html,
        alternative: true
      });

      // add plain text message if does not exist
      if (!msg.text) {
        msg.text = html2text(msg.html);
      }

      delete msg.html;
    }

    // add attachments from data _attachments
    if (data._attachments) {
      data._attachments.forEach( function (att) {
        msg.attachment.push( att );
      });
    }

    return msg;
  }
}

/**
 * Sets mail account data, sends mail through emailjs
 * @class Account
 */
class Account {
  constructor(options) {
    this.server = emailjs.server.connect(options);
  }

  /**
   * Returns promise emailjs send
   * @method _sendMail
   * @return {Promise}
   */
  _sendMail(renderedTemplate) {
    return new Promise((resolve, reject) => {
      this.server.send(renderedTemplate, (err, msg) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(msg);
      });
    });
  }
}

/**
 * Set new mail account
 *
 * Returns curlyMail when finish, so you can chain methods
 * Same options as [Emailjs](https://www.npmjs.com/package/emailjs#emailserverconnectoptions)
 *
 * Connection options:
 *
 * - user: username for logging into smtp
 * - password: password for logging into smtp
 * - host: smtp host
 * - port: smtp port (if null a standard port number will be used)
 * - ssl: boolean or object {key, ca, cert} (if true or object, ssl connection will be made)
 * - tls: boolean or object (if true or object, starttls will be initiated)
 * - timeout: max number of milliseconds to wait for smtp responses (defaults to 5000)
 * - domain: domain to greet smtp with (defaults to os.hostname)
 *
 * Example:
 * let options = {
 *  user: 'user',
 *  password: 'password',
 *  host: 'smtp.mailaddres.com',
 *  port: 25,
 *  tls: true,
 *  timeout: 15000
 * }
 * let mail = new CurledMail(options);
 *
 * @class CurledMail
 */
class CurledMail extends Account {
  constructor(options) {
    if (typeof options !== 'object') {
      throw new Error( 'asyncCurlyMail account has to be an object.' );
    }

    super(options);
    this.templates = {};
  }

  /**
   * Add template
   * @param key {String} Name of template
   * @param template {String} html template
   * @method addTemplate
   */
  addTemplate(key, template) {
    this.templates[key] = new Template(template);
  }

  /**
   * Sends emails with async functionality.
   * * Send message from a mail account
   *
   * Example:
   * ...
   * let mail = new CurledMail(options);
   * mail.addTemplate('mainAccount', {});
   * ...
   * let response = mail.send('mainAccount', {});
   *
   * Note: `_attachments` field in data object will be added to message
   * @method send
   * @param templateKey {String} Key for template that will be used.
   * @param data {Object} Data to be used in chosen template.
   * @return response from emailjs.
   */
  async send(templateKey, data) {
    if (typeof templateKey !== 'string' || !templateKey) {
      throw new Error('Invalid template.');
    }

    let template = this.templates[templateKey];
    let response;

    try {
      response = await this._sendMail(template.render(data));
    } catch (e) {
      response = e;
    }

    return response;
  }
}

module.exports = CurledMail;
