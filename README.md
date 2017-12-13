# formmail
```
$ docker build --name cpollet/formmail .
$ docker run -it --rm -p 8080:8080 \
  -e RECAPTCHA_SITE_KEY=... \
  -e RECAPTCHA_SECRET_KEY=... \
  -e MAILGUN_API_KEY=... \
  -e MAILGUN_DOMAIN=... \
  -e MAILGUN_FROM=... \
  -e MAILGUN_TO=... \
  cpollet/formmail
```
