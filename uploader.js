/**
 * Proccess multiple upload to server
 * @author TARiK <tarik@bitstore.ru>
 */
class Uploader
{
	/**
	 * form 		{string}	- form id
	 * submit 		{string}	- submit button id
	 * fileSelector {string}	- file selector id
	 * thumbnails	{string}	- container id for thumbnails
	 */
	constructor(form, submit, fileSelector, thumbnails)
	{		
		this.form = document.getElementById(form); 
		if (!this.form) 
			throw new Error('Uploader form element '+form+' not found.');
		
		this.submit = document.getElementById(submit); 
		if (!this.submit) 
			throw new Error('Uploader submit button '+submit+' not found.');
		
		this.fileSelector = document.getElementById(fileSelector); 
		if (!this.fileSelector)
			throw new Error('Uploader file selector input '+fileSelector+' not found.');
		
		this.thumbnails = document.getElementById(thumbnails); 
		if (!this.thumbnails)
			throw new Error('Thumbnails container '+thumbnails+' not found.');

		this.form.addEventListener('load', ()=> 
		{	
			console.log(this.form.target);
			this.form.target.style.display = 'block';
		});			

		
		this.fileSelector.addEventListener('change', event =>
		{	 
			this.submit.style.display = event.target.files.length ? 'block' : 'none';
						
			while (this.thumbnails.hasChildNodes()) 
				this.thumbnails.removeChild(this.thumbnails.lastChild);
			
			Array.from(event.target.files).forEach( file =>
			{					
				if (!file.type.match('image.*'))
					return;
					
				let reader = new FileReader();
					    					
				reader.addEventListener('load', event => 
				{
					let item = document.createElement('li');
					let image = document.createElement('img');
						image.setAttribute('src', event.target.result);
						image.setAttribute('title', escape(file.name));
					item.appendChild(image);
					let title = document.createElement('span');
						title.textContent = escape(file.name);
					item.appendChild(title);
					
					this.thumbnails.appendChild(item);
				});

	    		
	    		reader.readAsDataURL(file);   					
			    					
			});
		}, false);
	}
}
