# Password Hasher NG Firefox extension

An updated version of the classic Password Hasher add-on compatible with the new Webextension-API.

## Installation
1. Install the [Firefox add-on](https://addons.mozilla.org/en-US/firefox/addon/password-hasher-ng/)
2. Check the global add-on-settings

## Standalone version
Included in this release is a standalone-html-version of the hasher based on the work of https://github.com/redcatjs/passhash-ng-html

## Usage
1. Open a login page with a password field
2. To open the hasher do one of the following:
  * Click on the password-hasher-icon in the address-field of your browser
  * Use the keyboard-shortcut Ctrl-Shift-F6
  * Click on the "#"-symbol in or near the password-field
  * Use the right-click contextmenu on the password field to open password-hasher
3. Enter your master-key
4. Click ok or enter: Done!

## What does it do?
The hasher is generating a unique password for every site you visit. 
This works simply by creating a so called hash from the site-tag and your master-key. 
The site-tag is extracted of the domain and stored so it stays the same on every visit of this site. Together with your master-key (which is not stored) this results in a reusable hash:

### A little example:
You are visiting the login-page of https://www.github.com. The site-tag **github** is extracted from the domain. Now you enter your master-key.
```
site-tag: github
master-key: password
resulting hash: fnD'7ayb4nATjvdX
```
The resulting hash is now used as password for your github login.
Now you are moving on to another website https://www.heise.de. The extracted site-tag becomes now **heise**. By entering the same master-key you'll get a different hash:
```
site-tag: heise
master-key: password
resulting hash: 0"Ajd0PqrldvYjeA
```
Bam. Different passwords for every site. You only have to remember your master-key which is never stored anywhere.

