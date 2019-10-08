import { observable }  from 'mobx'

class JBSelectBoxData  {
    @observable options=[
        /*{
            value:'userName',
            caption:'نام کاربر',
            JBSelectBoxDetail:{ //its optional
                hidden:computed(function(){
                    return(this.searchHidden || this.externalHidden)
                  }),
                active:false,
                searchHidden:false,
                externalHidden:false,
                isITAddFreeRowOption,
                isFreeOptionRow,
            }
        } */

    ];
    //برای اینکه در حالت پیشفرض نمایش بدانیم با کدام متغییر ها کار کنیم و چه چیزی را از آبجکت ورودی نمایش دهیم
    @observable fieldsNames = {
        value:  'value',
        caption:'caption'
    }
    //مقدار پیشفرض سلکت
    @observable value = null;
    @observable placeHolder = "انتخاب کنید"
    triggers = {
        beforeChange:undefined,
        //its fill inside of componnet and if its call all filter and selected value get cleared
        resetStates : null,
        focus:undefined
    }
    callbacks = {
        //when user type something in text box to filter values this function will called 
        onFilterTextChange:undefined
    }
    autoFocus = false;
    //user can select and fill value that dont exist in options
    allowFreeSelect = false;
    allowNull = true;
    isLoading = false;
}
export default JBSelectBoxData;
