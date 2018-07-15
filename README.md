# Project: Blink detection and counter


### Initiative

It's so easy to stare the screen for too long and forget to blink!
So comes this blink detection.
But it can only detect and count blinks on webpage for now.
A reminder will follow if the blink detection engine becomes more efficient.
(The program burns your CPU while it runs!)


### Acknowledgement

All honor goes to [Affectiva](http://www.affectiva.com/)’s Emotion-as-a-Service API. They do all the effort to recognize facial landmarks and derive measurements of facial features.

Most of the code (including Get Started below) are from Udacity's [AIND-CV-Mimic project](https://github.com/Udacity/AIND-CV-Mimic). The only tweak is to count blinks based on eyeClosure measurement and show the measurement history with [ECharts](http://echarts.baidu.com).


### Get Started

In order to access the webcam stream, modern browsers require you to serve your web app over HTTPS. To run locally, you will need to general an SSL certificate (this is a one-time step):

- Open a terminal or command-prompt, and ensure you are inside the `AIND-CV-Mimic/` directory.
- Run the following shell script: `generate-pemfile.sh`

This creates an SSL certificate file named `my-ssl-cert.pem` that is used to serve over https.

Now you can launch the server using:

```
python serve.py
```

_Note: The `serve.py` script uses Python 3._

Alternately, you can put your HTML, JS and CSS files on an online platform (such as [JSFiddle](https://jsfiddle.net/)) and develop your project there.


<a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-nd/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/">Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License</a>. Please refer to [Udacity Terms of Service](https://www.udacity.com/legal) for further information.
