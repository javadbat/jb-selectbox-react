import JBSelectBoxData                    from './JBSelectBoxData$Build_Type_Prefix.min'
import { observable,observe,intercept , extendObservable ,computed ,toJS}  from 'mobx'

class JBSelectBoxService {
    defaultConfig = new JBSelectBoxData();
    config;
    //we use props in our component for as limit as it can be
    props;
    @observable Dropstatus = {
        show : false
    }
    //لیست رفرنس ها و المنت های کامپوننت و دام ها در آن نگهدای میشود
    elements = {
        inputField:null,
        listElement:null
    }
    @computed get isShowListEmpty(){
        //اگر لیست خالی یا موارد لیست همه پمهان باشند
        var flag= true;
        this.config.options.forEach((item)=>{
            if(item.JBSelectBoxDetail.hidden== false){
                flag = false;
                return;
            }
        })
        return flag;
    }
    constructor(props){
        this.props = props;
        this.config =this.mergeObject(props.config,this.defaultConfig);
        observe(this.config,"options", (change)=>this.onComponentPropsChange(change));
        this.componentClassNames = props.className;
        this.onChangeEvent = props.onChange;
        this.config.triggers.resetStates = ()=>this.resetStates();
        this.config.triggers.focus = ()=>this.focusOnSelectBox();
        this.standardConfig();
        if(props.autoFocus == true || props.autoFocus == "true"){
            this.config.autoFocus = true
        }
    }
    onComponentPropsChange(change){
        //when config changes
        if(change.name =="options"){
            change.newValue.forEach(item=>{
                this.defineJBSelectBoxDetail(item);
            })
            this.config.options = change.newValue
        }
        
    }
    mergeObject(inputConfig,defaultConfig){
        var addedProperty = {}
        for(var prop in defaultConfig){
            if(inputConfig[prop]===undefined){
                addedProperty[prop]=defaultConfig[prop];
            }
            if(inputConfig[prop] === null){
                inputConfig[prop] = defaultConfig[prop]; 
            }
        }
        extendObservable(inputConfig,addedProperty)
        return inputConfig;
    }
    standardConfig(){
        this.config.options.map((item)=>{
            this.defineJBSelectBoxDetail(item);
        });
        if(this.config.allowFreeSelect){
            this.config.options.unshift({
                caption:"",
                value:""
            });
            this.defineJBSelectBoxDetail(this.config.options[0]);
            this.config.options[0].JBSelectBoxDetail.isFreeOptionRow = true;
        }
        //observe options so when they changed we add standard config to it
        intercept(this.config,'options',(change)=>{

           if(change.newValue.length>0){
               //add standard config
               change.newValue.map((item)=>{
                this.defineJBSelectBoxDetail(item);
               });
               //set new value
               
           }
           setTimeout(()=>this.UpdateValueByOptions(),0);
           return(change)
        });
        if(!this.props.config.fieldsNames){
            // if component input config dont have fieldname config
            var obj = {fieldsNames:toJS(this.config.fieldsNames)};
            extendObservable(this.props.config,obj);
        }
    }
    makeSelectedValueNull(){
        //when we want to component value set to null
        this.config.value = null,
        this.elements.inputField.value = "";
    }
    UpdateValueByOptions(newValue){
        //called after options changed and then we try to update value base on new option
        if(newValue == null || newValue == undefined){
            //shall we remove this if after switch to component did update ?
            newValue = this.props.value;
        }
        var optionObject = this.config.options.find(x=>x[this.config.fieldsNames.value]==newValue);
        if(!optionObject){
            //ممکن است مقدار انتخابی در کپشن فیلد ها باشد
            optionObject = this.config.options.find(x=>x[this.config.fieldsNames.caption]==newValue);
        }
        if(optionObject){
            this.config.value = optionObject;
            this.elements.inputField.value = optionObject[this.config.fieldsNames.caption];
        }
    }
    onInputFocus(event){
      this.focusOnSelectBox();
    }
    focusOnSelectBox(){
        this.Dropstatus.show = true;
        this.focusStatus = true;
        setTimeout(()=>{this.elements.inputField.focus()},0);
        if(this.config.options[0]){
            //if we have item already
            this.setActiveMenuItem(this.config.options[0]);
        }
        this.hideAddFreeRowOption();
    }
    hideAddFreeRowOption(){
        var addFreeRowOption = this.config.options.find(x=>x.JBSelectBoxDetail.isFreeOptionRow);
        if(addFreeRowOption && this.elements.inputField.value == ""){
            addFreeRowOption.JBSelectBoxDetail.addFreeRowOptionHidden = true;
        }
    }
    onInputblur(event){
        if(this.focusStatus){
            
            //اگر همچنان فوکوس را داشتیم
            setTimeout(()=>{
                //اگر کاربر به واسطه کلیک روی گزینه ها فوکوسش از دست داد اندکی با تاخیر منو پنهان شود تا
                //so click and select event execute before menu get hide
                this.Dropstatus.show = false;
                this.focusStatus = false;
                this.resetSearchHidden();
            },200);
            if(this.config.value!=undefined && this.config.value!=null){
                if(this.config.value[this.config.fieldsNames.value] || this.config.value[this.config.fieldsNames.caption.length>0]){
                    //sometime external value is object but it is empty object waiting to fill so we detect if we face a empty obj or not
                    if(this.elements.inputField.value == "" && this.config.allowNull){
                        //if user emptied field
                        this.resetStates();  
                    }else{

                        //if the input has some none sense value but not empty
                        this.elements.inputField.value = this.config.value[this.config.fieldsNames.caption]
                    }
                    
                }
                if(this.config.allowFreeSelect){
                    //todo add current text as a freeselect item and select it 
                    //if its different from prev selected and no other similar added before 
                }
            }else{
                
                //if our prev selected value is empty
                if(this.config.allowFreeSelect){
                    //add current text as a freeselect item and select it
                    this.selectCurrentActiveMenu();
                }else{
                    this.elements.inputField.value = ""
                }
            }
        }


     }
    setActiveMenuItem(item){
        var currentActiveItem = this.getActiveMenuItem();
        if(currentActiveItem){
            currentActiveItem.JBSelectBoxDetail.active = false;
        }
        if(item){
            item.JBSelectBoxDetail.active = true;
        }
       
    }
    DeactivateMenuItem(){
        var currentActiveItem = this.getActiveMenuItem();
        if(currentActiveItem){
            currentActiveItem.JBSelectBoxDetail.active = false;
        }
    }
    onInputKeyUp(event){
        switch(event.keyCode){
            case 40:
                // down arrow key
                var currentIndex = this.getActiveMenuItemIndex();
                var newIndex = this.SetActiveMenuItemIndexToNext(currentIndex);
                this.setScroll(event , newIndex);
            break;
            case 38:
                // up arrow key
                var currentIndex = this.getActiveMenuItemIndex();
                var newIndex = this.SetActiveMenuItemIndexToPrev(currentIndex);
                this.setScroll(event , newIndex)
            break;
            case 13:
                this.selectCurrentActiveMenu(); 
            break;
            default:
                if(this.config.allowFreeSelect){
                    this.updateAddFreeRowOption(event.target.value);
                }
                if(this.config.callbacks.onFilterTextChange){
                    this.config.callbacks.onFilterTextChange(event);
                }
                this.filterMenuListByString(event.target.value);
                
            return true;
            break;
        }
    }
    setScroll(event,ActiveMenuItemIndex){
        var currentScrollPosition = this.elements.listElement.scrollTop;
        var currentItemTop =  this.config.options[ActiveMenuItemIndex].JBSelectBoxDetail.optionDom.offsetTop;
        var listHeight = this.elements.listElement.clientHeight;
        if(currentItemTop>currentScrollPosition+listHeight){
            this.elements.listElement.scroll(0,currentItemTop);
        }
        if(currentItemTop<currentScrollPosition){
            this.elements.listElement.scroll(0,currentScrollPosition-listHeight);
        }
       
    }
    updateAddFreeRowOption(newValue){
        //ww show current typed value as a option to select
        var addFreeRowOption = this.config.options.find(x=>x.JBSelectBoxDetail.isFreeOptionRow);
        if(newValue == ""){
            addFreeRowOption.JBSelectBoxDetail.addFreeRowOptionHidden = true;
        }else{
            addFreeRowOption[this.config.fieldsNames.value] = newValue;
            addFreeRowOption[this.config.fieldsNames.caption] = newValue;
            addFreeRowOption.JBSelectBoxDetail.addFreeRowOptionHidden = false;
        }
    }
    selectCurrentActiveMenu(){
        var selectedItem = this.getActiveMenuItem();
        if(!selectedItem){
            return;
        }else{
            if(!selectedItem.JBSelectBoxDetail.hidden){
                this.selectItem(selectedItem);
            }
        }

    }
    selectItem(item){
        //انتخاب یک ایتم به عنوان مقدار
        //check with beforechange event and wait for response
        //idont implement wait and save it for later use
        if(this.config.triggers.beforeChange){
            this.config.triggers.beforeChange({
                selectedItem : item
            });
        }
        //set value
        this.config.value = item;
        //fire onchange
        if(this.onChangeEvent) {
           this.onComponentValueChange();
        }
        //hide option list
        this.Dropstatus.show = false;
        this.elements.inputField.value = item[this.config.fieldsNames.caption];

    }
    SetActiveMenuItemIndexToNext(currentIndex){
        //ایتم فعال منو را یکی به جلو میبرد
        if(currentIndex == this.config.options.length-1){
            currentIndex = -1
        }
        var nextIndex = currentIndex +1;
        this.config.options.forEach((item,index)=>{

            if(this.config.options[nextIndex].JBSelectBoxDetail.hidden != true){
                //if next item is hidden we seek for next
                return;
            }
            nextIndex++;
            if(nextIndex == this.config.options.length){
                //if we seek last item we go back to first of a list
                nextIndex = 0;
            }
            if(index+1 == this.config.options.length){
                //if our list is empty
                return -1;
            }
        })
        this.setActiveMenuItem(this.config.options[nextIndex]);
        return nextIndex;
    }
    SetActiveMenuItemIndexToPrev(currentIndex){
        //ایتم فعال منو را یکی به جلو میبرد
        if(currentIndex == 0){
            currentIndex = this.config.options.length
        }
        var prevIndex = currentIndex -1;
        this.config.options.forEach((item,index)=>{
            if(this.config.options[prevIndex].JBSelectBoxDetail.hidden != true){
                //if next item is hidden we seek for next
                return;
            }
            prevIndex--;
            if(prevIndex == -1){
                //if we seek last item we go back to first of a list
                prevIndex = this.config.options.length-1;
            }
            if(index+1 == this.config.options.length){
                //if our list is empty

            }
        })
        this.setActiveMenuItem(this.config.options[prevIndex]);
        return prevIndex;
    }
    filterMenuListByString(filterString){

        var isActivitedItemHided = false;
        this.config.options.forEach((item,index)=>{
            if(item[this.config.fieldsNames.caption].includes(filterString)){
                item.JBSelectBoxDetail.searchHidden = false;

            }else{
                item.JBSelectBoxDetail.searchHidden = true;
                if(item.JBSelectBoxDetail.active == true){
                    //اگر ایتمی که فعال بود در سرچ حذف شد ایتم اول را بعد از اتمام فیلترینگ فعال میکنیم
                    isActivitedItemHided = true;
                }
            }
        });
        if(this.isShowListEmpty){
            //اگر هیچ آیتم فعالی نداشتیم
            var index = this.getActiveMenuItemIndex();
        }
        if(isActivitedItemHided){
            //اگر ایتم فعال پنهان شده بود
            this.SetActiveMenuItemIndexToNext(-1);
        }
        
    }
    getActiveMenuItem(){
        // ایتم آبی و انتخاب شده سلکت باکس از منو اپشن ها
        //را برمیگرداند

        //برای استاندارد کردن دیتای هر ایتم

        var activeItem =  this.config.options.find((item)=>{
            this.defineJBSelectBoxDetail(item);
                if(item.JBSelectBoxDetail.active == true){
                    return item;
                }
        });
        return activeItem;
    }
    getActiveMenuItemIndex(){
        //  ایندکس در ارایه ایتم آبی و انتخاب شده سلکت باکس از منو اپشن ها
        //را برمیگرداند

        //برای استاندارد کردن دیتای هر ایتم
        var activeItemIndex =  this.config.options.findIndex((item, index)=>{
            this.defineJBSelectBoxDetail(item);
                if(item.JBSelectBoxDetail.active == true){
                    return item;
                }
        });
        return activeItemIndex;
    }
    defineJBSelectBoxDetail(item){
        //اگر ایتمی به هر شکل  فیلد جزییات را نداشت به آن با مقادیر پیشفرض افزوده میشود
        if(typeof(item.JBSelectBoxDetail) != "object" ){
            extendObservable(item,{
                JBSelectBoxDetail:{
                     get hidden(){
                      return(this.searchHidden || this.externalHidden || this.addFreeRowOptionHidden)
                    },
                    active:false,
                    //hide for huser search
                    searchHidden:false,
                    //hide drop down item from external of component
                    externalHidden:false,
                    //hide add free row option on empty input
                    addFreeRowOptionHidden:false,
                    //if allowFreeSelect is true we add this option in first row so we can find and detect the added add row by this property
                    //mean only add free item button has this property true
                    isFreeOptionRow:false,
                }
            });
        }
    }
    resetStates(){
        //remove filter value and selected value and every aspect of user footprint
        this.config.value = null,
        this.elements.inputField.value = ""
        this.resetSearchHidden();

    }
    resetSearchHidden(){
        this.config.options.forEach((item,index)=>{
            item.JBSelectBoxDetail.searchHidden = false;
        })
    }
    onComponentFocus(e){
        this.elements.inputField.focus();
    }
    onComponentValueChange(){
        //call onChange callback
        //temporary we do it ourself
        //مقدار فیلد ولیو عنصر تنتخاب شده
        var pureValue = this.config.value[this.config.fieldsNames.value];
        if(pureValue == null || pureValue == undefined){
            //اگر عنصر انتخاب شده مقدار برایش ست نشده بود
            pureValue = this.config.value[this.config.fieldsNames.caption];
        }
        //we dont make it reacive
        var event = new CustomEvent("change",{
            detail: {
                newValue:pureValue,
                newValueObject : this.config.value,
			},
			bubbles: true,
			cancelable: true,
        });
        event.simulated = true;
        let tracker = this.JBSelectBoxComponentDom._valueTracker;
        if (tracker) {
            tracker.setValue(pureValue);
        }
        this.JBSelectBoxComponentDom.value = pureValue;
        this.JBSelectBoxComponentDom.onchange = (e)=>this.onChangeEvent(e);
        this.JBSelectBoxComponentDom.dispatchEvent(event);
    }
    observeValue(props){
    }
}
export default JBSelectBoxService;
