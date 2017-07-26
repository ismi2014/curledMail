Lightweight SMTP email sending with mustache templates support for messages, it's based on [curlyMail](https://raw.githubusercontent.com/jacoborus/curlymail), which is built on top of [Hogan.js](http://twitter.github.io/hogan.js/) and [Emailjs](https://github.com/eleith/emailjs). Runs on Node.js (requires v. 7 or above).

Usage example:
--------------

```js
const curledMail = require('curledmail');

// add a email account and connect it to its SMTP server
const curledAccount = new curledMail({
    user: 'username@domain.com',
    password: 'PA55W0RD'
});

// add a message template with mustaches
curledMail.addTemplate('weekly', {
    from:    "{{appname}}",
    to:      "{{username}} <{{email}}>",
    subject: "Testing curlyMail",
    html:    "<html>{{filename}} is ready for download</html>",
    attachments: [
        {path:"path/to/photo.jpg", name:"renames.jpg"}
   ]
});

// data to render the template
let data = {
    username: 'Mr. Code',
    email: 'curledmail@domain.com',
    appname: 'curledmail co.',
    filename: 'Timetable',
    // _attachments in render data will be added to message without being rendering
    _attachments: [
        {path:"path/to/file.zip", name:"timetable.zip"}
   ]
};

// send a message
let response = curledMail.send('weekly', data);
```


Installation
------------

```sh
npm install curledmail
```


© 2017 Ismael Perez - [ismi2014](https://github.com/jacoborus)

Released under [MIT License](https://raw.github.com/jacoborus/curledmail/master/LICENSE)
