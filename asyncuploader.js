/**
 * Process multiple async file upload to server
 * @author TARiK <tarik@bitstore.ru>
 */
class AsyncUploader
{
	/**
	 * url 		{string}		- target url
	 * submit 		{string}	- submit button id
	 * fileSelector {string}	- file selector id
	 * thumbnails	{string}	- container id for thumbnails
	 * completed	{function}	- on complete callback
	 */
	constructor(url, submit, fileSelector, thumbnails, completed = null)
	{
		let filesCount = 0;

		// Creates hidden parameter for file blob
		this.file = Symbol();
		
		this.submit = document.getElementById(submit); 
		if (!this.submit) 
			throw new Error('Uploader submit button '+submit+' not found.');
		
		this.fileSelector = document.getElementById(fileSelector); 
		if (!this.fileSelector)
			throw new Error('Uploader file selector input '+fileSelector+' not found.');
		
		this.thumbnails = document.getElementById(thumbnails); 
		if (!this.thumbnails)
			throw new Error('Thumbnails container '+thumbnails+' not found.');

		this.fileSelector.onchange = event =>
		{
			filesCount = 0;

			this.submit.removeAttribute('disabled');
			this.submit.style.display = event.target.files.length ? 'block' : 'none';
						
			while (this.thumbnails.hasChildNodes()) 
				this.thumbnails.removeChild(this.thumbnails.lastChild);
			
			Array.from(event.target.files).forEach( file =>
			{					
				if (!file.type.match('image.*'))
					return;

				filesCount++;

				let item = document.createElement('li');
				let image = document.createElement('img');
					image.setAttribute('title', file.name);
					item.appendChild(image);

				let title = document.createElement('input');
					title.type = "text"
					title.value = file.name;
					title.type = 'text';
					title.name = 'filename['+file.name+']';
				item.appendChild(title);

				let fileURL = URL.createObjectURL(file);
				
				image.src = fileURL;
				this.thumbnails.appendChild(item);
				item[this.file] = file;				
			});
		};
		
		this.submit.onclick = event =>
		{
			let uploaded = 0;

			event.preventDefault();
			event.stopPropagation();
			this.submit.setAttribute('disabled', 'disabled');
			
			this.thumbnails.childNodes.forEach(item => 
			{
				let progress = item.querySelector('div.progress'), 
					perc = item.querySelector('div.progress > span');
								
				if (!progress)
				{
					progress = document.createElement('div');
					progress.className = 'progress';
						
					perc = 	document.createElement('span');
					perc.style.width = 0;
					progress.appendChild(perc);
			
					item.appendChild(progress);
				}
				
				perc.style.width = '0%';
				perc.className = null;
				
				
				let data = new FormData();
				
				data.append(this.fileSelector.name, item[this.file]);
				data.append('title', item.childNodes[1].value)
				
				let req = new XMLHttpRequest();
				req.open ('post', url, true);
				req.send(data);
				
				req.addEventListener('progress', event =>
				{	
					let tmpPerc;			
					if (event.lengthComputable)			
						perc.style.width = event.loaded / event.total * 100 + '%';
					else
						perc.style.width = tmpPerc += 5 + '%';
				});
				
				req.addEventListener('load', event => 
				{
					let response = event.target.responseXML,
						type = response.documentElement.getAttribute('response');

					perc.className = type;

					uploaded++;

					if (uploaded >= filesCount)
					{
						this.submit.removeAttribute('disabled');
						this.submit.style.display = 'none';
					}
					//console.dir(response);
					
					if (type == 'rejected')
					{
						let exception = response.documentElement.getElementsByTagName('exception')[0];
						let el = item.lastChild.localName=='span' ? item.lastChild : document.createElement('span');
						el.textContent = exception.getAttribute('message')
						el.className = 'error';
					
						if (item.lastChild.localName!='span')
							item.appendChild(el);
						
						return;
					}
					
					while (item.childNodes.length > 1) 
						item.removeChild(item.lastChild);
					
					let message = response.documentElement.getElementsByTagName('file')[0];
					let el = item.lastChild.localName=='span' ? item.lastChild : document.createElement('span');
					el.textContent = message.getAttribute('message')
					el.className = 'done';
				
					if (item.lastChild.localName!='span')
						item.appendChild(el);			
					
					if (typeof completed == 'function')
						completed(response);
				});
			});
		}
	}
}