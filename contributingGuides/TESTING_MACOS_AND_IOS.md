# Test MacOS and iOS app on Windows/Linux

If you need help, have any questions or suggestions, please ask in the [`#expensify-open-source` Slack channel](https://github.com/Expensify/App/blob/main/contributingGuides/CONTRIBUTING.md#asking-questions).

The majority of the contributors need MacOS for short bursts of time for the purpose of testing. Cloud services that offer MacOS instances like AWS, MacInCloud, MacStadium etc have a very high minimum cost. [Scaleway’s M1 Mac minis](https://www.scaleway.com/en/hello-m1/) provide dedicated instances at just $2.7 per day.

| **Cloud provider**|**Minimum cost** |
| ----------- | ----------- |
| **Scaleway** | **$2.7 per day 🥇** |
| MacInCloud |$19 for 5 days, or **$35 per month** |
| MacStadium | $132 per month |
| AWS | $26 per day |

## How to get started
Scaleway
1.  Create an account on [scaleway](https://www.scaleway.com/en/hello-m1/).
2.  Select “Build” as the account level.
3.  Add billing information and verify the payment method.
4.  Complete the identity check using any govt issued ID.
5.  You’ll be notified after the identity verification is complete.
6.  You can now create a Mac mini M1 instance.
<hr>
Now that a Mac instance is up and running, you’ll need to get access to the MacOS GUI. 

Using a [VNC](https://www.realvnc.com/en/connect/download/vnc/) is the easiest way to do this, but it’s not very responsive and extremely slow to use.

So we’ll set up [Chrome Remote Desktop](https://remotedesktop.google.com/) on the instance as it’s faster than VNC.

1.  From Scaleway’s dashboard, note the public IP address and VNC password for your Mac instance.
2.  Install and run a VNC client like - [real VNC](https://www.realvnc.com/en/connect/download/vnc/) on your local machine.  
3.  On the VNC client, enter the IP address followed by the port number 5900 to connect to the Mac instance. Eg: 158.72.143.9:5900

You now have access to the MacOS GUI. Now let’s set up chrome remote desktop on it.

4.  Download google chrome.
5.  Go to [remotedesktop.google.com/access](https://remotedesktop.google.com/access) and set up remote access on the MacOS instance. 
6.  Once that’s done, you can access the Mac instance’s GUI using your local machine from this website - [remotedesktop.google.com/access](https://remotedesktop.google.com/access).
7.  Run the following commands to install tools like cocoapods, node etc which are needed to run New Expensify.
```
# Install homebrew
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

# Add homebrew to your PATH
echo  'eval "$(/opt/homebrew/bin/brew shellenv)"'  >> /Users/m1/.zprofile
eval  "$(/opt/homebrew/bin/brew shellenv)"
source  ~/.zprofile

# Install nodejs
brew install node@14

# Add nodejs to your PATH
echo  'export PATH="/opt/homebrew/opt/node@14/bin:$PATH"'  >>  ~/.zshrc
sudo ln -s $(which node) /usr/local/bin/node

# For compilers to find nodejs
export LDFLAGS="-L/opt/homebrew/opt/node@14/lib"
export CPPFLAGS="-I/opt/homebrew/opt/node@14/include"
source  ~/.zshrc

# Install cocoapods
sudo gem install ffi -- --enable-system-libffi
brew install cocoapods
```

You now have a dedicated Mac machine running 🎉

The clipboard is shared with your local machine, and it’s crazy fast and responsive.
