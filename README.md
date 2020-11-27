# KUFillingGood

## Deployment

0. Init and setting your project.
1. __CHANGE__ `firebaseConfig` __TO YOUR PROJECT CONFIG__
2. Change `SubjectAPI` in `public/main.js` to your SubjectAPI Source
3. Run `firebase functions:config:set ku.username="<username>" ku.password="<password>" ku.appkey="txCR5732xYYWDGdd49M3R19o1OVwdRFc" api.secret="<Your Secret>"` to set Username, Password, and Cache reload API Secret
4. Run `gsutil cors set cors.json gs://<BUCKET_NAME>` to enable cors header for API.
5. Run `firebase deploy` to deploy everything.

## Pull request & Issue ticket

You can make.

## License

[MIT License](https://github.com/Shayennn/KUFillingGood/blob/master/LICENSE.md)
