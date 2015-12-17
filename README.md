## Screens

### Development

#### Prerequisites
- [Docker](https://www.docker.com/docker-toolbox)
- [Heroku Toolbelt](https://toolbelt.heroku.com/)
- Heroku Docker plugin -- `heroku plugins:install heroku-docker`

#### Setting up development environment
- Clone the repository -- `git clone git@github.com:ftlabs/screens.git`
- Change in repository directory -- `cd screens`
- If running OS X or Windows, [follow these steps for creating a virtual machine for Docker](#creating-a-virtual-machine-for-docker) -- This is a section in this file.
- Build a Docker image -- `docker build .`
- Spin up the web process in a container -- `docker-compose up`
- Open the application in your browser of choice -- `open "http://$(docker-machine ip default):8080"`

##### [Creating a virtual machine for Docker](#creating-a-virtual-machine-for-docker)
 [VirtualBox](https://www.virtualbox.org/wiki/Downloads) or [VMWare](http://www.vmware.com/uk/).

- Check if you already have a Docker machine set-up -- `docker-machine ls`
If you don't have a Docker machine set-up:
- Create a virtual machine (named default) -- `docker-machine create --driver virtualbox default` (change the driver value if using vmware)
If/Once you have a Docker machine set-up:
- Check that your machine is running -- `docker-machine ls` -- _It is active if it has a `*` in the `ACTIVE` column_
- If machine is not running, boot it up -- `docker-machine start default`
- Add environment variables to your computer in order to let Docker communicate with the virtual machine -- `eval "$(docker-machine env default)"` -- It is recommended to add this to your `bash_profile` or similar.

### Deploying
We can deploy either by using Heroku's Docker plugin or by the Git plugin.

- Deploy a new release using Heroku's Docker plugin -- `heroku docker:release --app {APP_NAME}`
- Deploy using Heroku's Git plugin -- `git push {HEROKU_GIT_REMOTE_NAME} master`

These are not equivalent deployment processes:

The Docker plugin will build a docker image, mount the container, tarball the app directory and send that to Heroku's releases API. 

The Git plugin will push a branch to Heroku's Git repository, which will then be built using Heroku's buildpack, on installation of the application it will run `bower install && gulp build` as that is defined in the "post-install" script in the `package.json` file.

By using the Docker plugin approach, we would be able to remove the development tools from being deployed to Heroku alongside the appliaction.
