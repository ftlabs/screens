/* eslint-env browser */
/* global YT, console */
const YTG = (function(){

	let player;
	let bufferingTO;
	const coverCard = document.getElementById('cover_card');
	const mediaURI = window.location.href.split('mediaURI=')[1].split('&')[0];
	const mediaType = window.location.href.split('mediaType=')[1].split('&')[0];

	const playerStates = {
			'-1' : 'unstarted',
			'0' : 'ended',
			'1' : 'playing',
			'2' : 'paused',
			'3' : 'buffering',
			'5' : 'cued'
		};

	const playerOptions = {
			width: window.innerWidth,
			height: window.innerHeight,
			events: {
				'onReady': playerReady,
				'onStateChange': playerStateChange,
				'onError' : playerError
			},
			playerconsts : {
				controls : 0,
				modestbranding : 1
			}
		};

	function showCoverCard(){
		coverCard.setAttribute('data-visible', 'true');
	}

	function hideCoverCard(){
		coverCard.setAttribute('data-visible', 'false');
	}

	function checkNetworkState(){

		return new Promise(function(resolve, reject){

			const nR = new XMLHttpRequest();

			nR.onload = function(){

				if(nR.status === 200){
					resolve('A-OK');
				} else {
					reject('The network test endpoint returned a status code other than 200');
				}

			};

			nR.ontimeout = function(){
				reject('The test request timed out');
			};

			nR.onerror = function(){
				reject('There was an error when testing the connectivity of the network');
			};

			nR.timeout = 8000;
			nR.open('GET', window.location.origin + '/viewer');
			nR.send();

		});

	}

	function destroyPlayer(){
		console.log('PLAYER DESTROYED');
		player.destroy();
	}

	function createPlayer(){
		console.log('PLAYER CREATED');
		player = new YT.Player('yt-player', playerOptions);
	}

	function onYouTubeIframeAPIReady() {
		createPlayer();
	}

	function playerReady() {

		let playListOptions;

		if(mediaType === 'playlist'){
			// This is a playlist URI.
			playListOptions = {
				list : mediaURI
			};
		} else if(mediaType === 'video') {
			// This is a single video URI
			playListOptions = {
				playlist : mediaURI
			};
		}

		player.loadPlaylist(playListOptions);
		player.setLoop(true);

	}

	function playerStateChange(evt){

		console.log(playerStates[evt.data]);

		if(playerStates[evt.data] === 'playing'){
			hideCoverCard();
			console.log('Now playing: %s', player.getVideoData().title);
		} else if(playerStates[evt.data] === 'buffering'){

			bufferingTO = setTimeout(function(){

				if(playerStates[player.getPlayerState()] === 'buffering'){

					showCoverCard();
					handleNetworkIssues();

					clearTimeout(bufferingTO);
					bufferingTO = undefined;

				}

			}, 10000);

		} else if(bufferingTO !== undefined){
			clearTimeout(bufferingTO);
			bufferingTO = undefined;
		}

	}

	function handleNetworkIssues(){

		console.log('Handling network issues');

		checkNetworkState()
			.then(function(networkStatus){
				console.log(networkStatus);
				destroyPlayer();
				createPlayer();
				hideCoverCard();
			})
			.catch(function(err){
				console.error(err);
				// Fail gracefully - Check network periodically

				setTimeout(function(){

					handleNetworkIssues();

				}, 20000);

			})
		;

	}

	function playerError(error){

		const errCode = error.data;

		const errors = {
			'-1' : {
				shortReason : 'unstarted',
				longReason : 'Something has gone wrong with the player. It likely can\'t access the video resource on the network'
			},
			'2' : {
				shortReason : 'invalidparameter',
				longReason : 'The request contains an invalid parameter value.'
			},
			'5' : {
				shortReason : 'html-error',
				longReason : 'The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.'
			},
			'100' : {
				shortReason : 'no-video',
				longReason : 'This error occurs when a video has been removed (for any reason) or has been marked as private.'
			},
			'101' : {
				shortReason : 'no-embed',
				longReason : 'The owner of the requested video does not allow it to be played in embedded players.'
			},
			'105' : {
				shortReason : 'no-embed',
				longReason : 'The owner of the requested video does not allow it to be played in embedded players.'
			}

		};

		if (errors[errCode].shortReason === 'html-error' || errors[errCode].shortReason === 'unstarted'){

			console.log(errors[errCode].longReason);

			//Check network status, if connected -> restart - if not -> handle gracefully, alert admin

			showCoverCard();
			handleNetworkIssues();

		}

	}

	document.title = 'FT Screens || Youtube Generator';

	return {
		onYouTubeIframeAPIReady : onYouTubeIframeAPIReady
	};

}());

window.onYouTubeIframeAPIReady = YTG.onYouTubeIframeAPIReady;
