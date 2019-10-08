# jb-selectbox-react

customizable drop-down menu can filter resualt by typing and support lazy load and loading

## installation

run `npm install jb-selectbox-react` to install package with npm

## usage

import component in your page `import JBSelectBox from 'jb-selectbox-react'`  
you can import special edition for different envirement like es6 or requirejs or systemjs like:  
`import JBSelectBox from 'jb-selectbox-react/dist/JBSelectBox.cjs.min'` for requirejs version  
`import JBSelectBox from 'jb-selectbox-react/dist/JBSelectBox.min'` for standard es6  
`import JBSelectBox from 'jb-selectbox-react/dist/JBSelectBox.systemjs.min'` for systemjs  

use below syntax in your render function

`<JBSwitch value={this.vm.booleavValue} trueTitle='true caption' falseTitle='false caption' onChange={(e)=>this.vm.onChange(e)} onBeforeChange={(e)=>this.service.onBeforeChange(e)}></JBSwitch>`

as you can see in above example `value` is on-way binding like normal react forms input trueTitle is a title that place on true side of component and get bold on `value == true` onChange is standard too  
the special thing about this component is `onBeforeChange` event that is optional but when defined you can show loading before before changing actual value and after your REST call or any othe async method you change actual value.  
for example:  

```javascript
 onBeforeChange(newValue){
    return new Promise((resolve,reject)=>{
        fetch(request).then((response)=>return response.json).then((data)=>{
            resolve();
        }).catch(()=>{reject()});
    })
}
```

so when resolve called after REST call the `onChange` prop will be called.  
demo image:    
![](demo-gif.gif)