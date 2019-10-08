import React         from 'react'
import JBSelectBoxService from './JBSelectBoxService'
import { observer }            from 'mobx-react'
import './JBSelectBox.css'
@observer
class JBSelectBox extends React.Component {

    constructor(props){
        super(props);
        this.service = new JBSelectBoxService(props);
    }
    componentDidUpdate(prevProps){
        //called when a prop changed
        //update component value when value change from outside of component
        var changeValuePermissionFlag = false;
        if(prevProps.value == null &&  this.props.value != null){
            changeValuePermissionFlag = true
        }
        if(prevProps.value != null &&  this.props.value == null){
            this.service.makeSelectedValueNull();
        }
        if( (prevProps.value != null && prevProps.value != undefined) && this.props.value != prevProps.value){
            changeValuePermissionFlag = true;
        }
        if(changeValuePermissionFlag){
            //when value change
            this.service.UpdateValueByOptions(this.props.value);
        }else{
               // ExceptionHandler.newException(this.config.options,'your option list dont contain the value you set')
        }
    }
    componentDidMount(){
        if(this.service.config.autoFocus == true){
            this.service.onComponentFocus();
        }
        if(this.props.value != null && this.props.value != undefined){
            //first initiation need to set value. next time component didupdate update the true value
            this.service.UpdateValueByOptions(this.props.value);
        }
    }
    render () {
        return(
            <div className={"jb-select-box-component "+(this.service.componentClassNames != undefined?this.service.componentClassNames:'')} onFocus={(e)=>this.service.onComponentFocus(e)} ref={(dom)=>{this.service.JBSelectBoxComponentDom = dom}}>
                <section key="1" className="input-field">
                    <input placeholder={this.service.config.placeHolder} type="text" onFocus={(e)=>this.service.onInputFocus(e)} onBlur={(e)=>this.service.onInputblur(e)} onKeyUp={(e)=>{this.service.onInputKeyUp(e)}} ref={(element)=>{this.service.elements.inputField = element}} />
                    <div key="3" className="icon-wrapper" onClick={(e)=>this.service.onInputFocus(e)}>
                    {
                        this.service.config.isLoading&&
                        <svg className="circular-loader"viewBox="25 25 50 50" >
                            <circle className="loader-path" cx="50" cy="50" r="20" fill="none"   />
                        </svg>
                    }
                    {
                        !this.service.config.isLoading&&
                        <svg viewBox="0 0 800 800" className="arrow-icon">
                            <polygon points="0,200 800,200 400,600"/>
                        </svg>
                    }
                        
                    </div>
                </section>
                
                <section key="2" className={"input-list "+( this.service.Dropstatus.show?'':'hidden')} ref={(ref)=>this.service.elements.listElement = ref}>
                    <ul>
                    {
                        this.service.config.options.map((item,index)=>{
                            if(!item.JBSelectBoxDetail.hidden){
                                return(
                                    <li  onClick={(e)=>this.service.selectItem(item)} onMouseOver={(e)=>this.service.setActiveMenuItem(item)} className={""+(item.JBSelectBoxDetail.active?'active':'')+(item.JBSelectBoxDetail.isFreeOptionRow?' free-option-row':'')} key={'jb-select-item-'+index} value={item[this.service.config.fieldsNames.value]} ref={(ref)=>item.JBSelectBoxDetail.optionDom = ref}>{item[this.service.config.fieldsNames.caption]} </li>
                                )
                            }
                        })
                        
                    }
                    {
                        this.service.isShowListEmpty&&
                        <li className="empty-list-caption">موردی برای انتخاب وجود ندارد</li>
                    }
                    </ul>
                </section>
            </div>
        )
    }

}
export default JBSelectBox;