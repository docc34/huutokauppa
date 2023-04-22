import { useState, useEffect, useCallback } from 'react'
import { useCookies } from 'react-cookie';

import "react-datetime/css/react-datetime.css";
import './AuctionController.css';

import ReactDataGrid from '@inovua/reactdatagrid-community'

import Button from 'react-bootstrap/Button';
import CloseButton from 'react-bootstrap/CloseButton';

import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import {handleInputChange} from  '../functions/handleInputChange'
import moment from 'moment';
import 'moment-timezone';
import Datetime from 'react-datetime';
import { NavLink } from 'react-bootstrap';

const AuctionController = ()=>{
    const [loggedIn, setLoggedIn] = useState(false);
    const [auctionItems, setAuctionItems] = useState(false);
    const [selectedRow, setSelectedRow] = useState(true);
    const [selectedRowValue, setSelectedRowValue] = useState("");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginVisibilityModal, setLoginVisibilityModal] = useState(false);
    
    const [message, setMessage] = useState("");

    const [cookies, setCookie,removeCookie] = useCookies(['token']);
    
    const [auctionItemPostModal, setAuctionItemPostModal] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [closingTime, setClosingTime] = useState("");
    const [startingPrice, setStartingPrice] = useState("");
    const [imageFiles, setImageFiles] = useState(null);
    const [errors, setErrors] = useState([]);
    const [auctionItemType, setAuctionItemType] = useState(1);
    const [auctionItemRaisePeriod, setAuctionItemRaisePeriod] = useState(0);
    
    const [auctionItemDeleteModal, setAuctionItemDeleteModal] = useState(false);
    
    const [auctionItemModifyModal, setAuctionItemModifyModal] = useState(false);
    const [titleModify, setTitleModify] = useState("");
    const [descriptionModify, setDescriptionModify] = useState("");
    const [closingTimeModify, setClosingTimeModify] = useState("");
    const [pastClosingTimeModify, setPastClosingTimeModify] = useState("");
    const [auctionItemTypeModify, setAuctionItemTypeModify] = useState(1);
    const [visible, setVisible] = useState(1);
    const [selecetdImages, setSelectedImages] = useState([]);
    
    const [auctionItemVisibilityModal, setAuctionItemVisibilityModal] = useState(false);

    const [usersBills, setUsersBills] = useState([]);
    const [billsMessage, setBillsMessage] = useState("");
    
    const [userId, setUserId] = useState("");
    
    const auctionItemsColumns = [
        {name:"id", header: "Id",  defaultVisible: false},
        {name:"title" , header:"Title",  defaultFlex:1},
        {name:"description" , header:"Description", defaultVisible: false},
        {name:"visible" , header:"Visible"},
        {name:"type" , header:"Type", defaultFlex:1 },
        {name:"typeId" , header:"typeId", defaultVisible: false },
        {name:"raiseClosingTimeInterval" , header:"Closing time interval" ,  defaultFlex:1},
        {name: 'closingTime',header: 'Closing Time', defaultFlex:2,},
        {name:"url" , header:"Url", defaultFlex:1, render: ({value}) => {
            return <a href={value}>Auction</a>
        }}
    ]
    const billsColumns = [
        {name:"id", header: "Id",  defaultVisible: false},
        {name:"auctionItemName" , header:"Name",  defaultFlex:1},
        {name:"winner" , header:"Auction winner", defaultFlex:2},
        {name:"winnerOffer" , header:"Winning offer", defaultFlex:1},
        {name:"amount" , header:"Amount",  defaultFlex:1},
        {name:"billDue" , header:"Bill Due", defaultFlex:2},
        {name:"destinationIban",header: "Destination IBAN", defaultFlex:3},
        {name:"paid" , header:"Is the bill paid", defaultFlex:1},
        {name:"billDate" , header:"Bill date", defaultFlex:2},
        // {name:"url" , header:"Url", defaultFlex:2, render: ({value}) => {
        //     return <a href={value}>Auction</a>
        // }}
    ]


    // {
    //     name: 'created',header: 'Created',defaultWidth: 150,
    //     // need to specify dateFormat
    //     dateFormat: 'YYYY-MM-DD, HH:mm',
    //     filterEditor: DateFilter,
    //     filterEditorProps: (props, { index }) => {
    //       // for range and notinrange operators, the index is 1 for the after field
    //       return {
    //         dateFormat: 'YYYY-MM-DD, HH:mm',
    //         placeholder: index == 1 ? 'Last login date is before...': 'Last login date is after...'
    //       }
    //     },
    //     //Momentjs formats the date
    //     render: ({ value, cellProps: { dateFormat } }) =>
    //       moment(value).format(dateFormat), 
    // },
    
    //functions
    const resetValues = ()=>{
        setLoginVisibilityModal(false);
        setPassword("");
        setEmail("");

        setMessage("");

        setImageFiles(null);

        setAuctionItemPostModal(false);
        setClosingTime("");
        setDescription("");
        setTitle("");
        setStartingPrice("");
        setAuctionItemRaisePeriod("");
        setAuctionItemType(1);

        setAuctionItemModifyModal(false);
        setClosingTimeModify("");
        setDescriptionModify("");
        setTitleModify("");
        setVisible(1);
        setAuctionItemTypeModify(1);
        setSelectedImages([]);

        setAuctionItemDeleteModal(false);

        setAuctionItemVisibilityModal(false);

    }

    const onSelectionChange = useCallback((e) => {
        setTitleModify(e.data?.title);
        setDescriptionModify(e.data?.description);
        setVisible(e.data.visible);
        setClosingTimeModify(e.data.closingTime);
        setPastClosingTimeModify(e.data.closingTime);
        setAuctionItemTypeModify(e.data.typeId);
        setSelectedRowValue(e.data);
        setSelectedRow(false);
    }, [])

    const applyErrorClass= field =>((field in errors && errors[field]===false)?' invalid-field':'')

    const setFileFromInput = e =>{
        if(e.target.files && e.target.files[0]){
            var files = [];
            Array.from(e.target.files).forEach(file => {
                files.push(file);
            });
            console.log(files);
            setImageFiles(files);
        }
        else{
            setImageFiles(null);
        }
    }

    //login
    const checkLoginStatus = async()=>{
        if(cookies.token != null){
            const options = {
                method: 'GET',
                headers: { "Authorization": `Bearer ${cookies.token}`}
            }
            let data = await fetch("https://horsetradingapidev.azurewebsites.net/api/Login", options);
            let loggedIn = await data.json();
            if(loggedIn == true){
                setLoggedIn(loggedIn);
            }
        }
    }

    const handleLogin = async() => {
        if(email != "" && password != ""){
            try{
                let data = await fetch("https://horsetradingapidev.azurewebsites.net/api/Login",{
                        method:'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body:JSON.stringify({email: email, password: password})
                    });
    
                let result = await data.json();
                
                if (result?.status == "Error") {
                    setMessage(result.message);
                    setPassword("");
                    setEmail("");            
                    removeCookie('token',{ path: '/' });
                }
                else if(result?.status == "Ok"){
                    console.log("login onnistu");
                    resetValues();
                    setCookie('token', result.token, { path: '/' })
                    window.location.reload();
                }
            }
            catch{
                setMessage("Error");
            }
        }  
    }

//Bills CR

    const postUsersBills = async()=>{
        if(usersBills?.length == 0){
            const options = {
                method: 'POST',
                headers: {"Authorization": `Bearer ${cookies.token}`}
            }

            var search = await fetch("https://horsetradingapidev.azurewebsites.net/api/Bills/CheckUsersBills",options);
            var result = await search.json();
            console.log(result);
            if(result?.status == "Error" && result?.message == "No new billable items found"&& result?.object?.value != null){
                setUsersBills(result?.object?.value);
                setBillsMessage(result?.message);
            }
            else if(result?.status == "Error"){
                await getUsersBills();
                setBillsMessage(result?.message);
            }
            else if(result?.status == "Ok" && result != null){
                setBillsMessage(result?.message);
                setUsersBills(result?.object?.value);
                // await fetchUsersBills();
            }

            else{
                setBillsMessage(result?.message);
            }
        }
    }

    const getUsersBills = async ()=>{
        const options = {
            method: 'GET',
            headers: {"Authorization": `Bearer ${cookies.token}`}
        }

        var search = await fetch("https://horsetradingapidev.azurewebsites.net/api/Bills/User",options);
        var result = await search.json();
        if(result?.status != "Error"){
            setUsersBills(result);
            // await fetchUsersBills();
        }
    }

//Auctionitem CRUD
    const postAuctionItem = async ()=>{
        if(title !== "" && description !== "" && closingTime !== "" && imageFiles!==null){
            console.log(imageFiles);
            const options = {
                method: 'POST',
                headers: {"Authorization": `Bearer ${cookies.token}`, 'Content-Type': 'application/json'},
                body: JSON.stringify({
                    title: title, 
                    description: description,
                    closingTime: closingTime,
                    visible: visible,
                    typeId: auctionItemType,
                    startingPrice: startingPrice != "" && startingPrice != null ? startingPrice : 0,
                    raiseClosingTimeInterval: auctionItemRaisePeriod//moment(closingTime).format('D.M.YYYY HH.MM.s')
                })
            }

            var search = await fetch("https://horsetradingapidev.azurewebsites.net/api/AuctionItems",options);
            var result = await search.json();
            if(result.status == "Error" || result == null){
                setMessage(result?.message);
            }
            else{
                await postImages(result?.message);
            }
        }
    }

    const fetchAuctionItems = async ()=>{
        if(cookies.token != null){
            const options = {
                method: 'GET',
                headers: {"Authorization": `Bearer ${cookies.token}`}
            }
            var search = await fetch("https://horsetradingapidev.azurewebsites.net/api/AuctionItems/User",options);
            var auctionItems = await search.json();
            if(auctionItems?.status == "Error"){
                setMessage(auctionItems?.message == "Error");
            }
            else if(auctionItems != null && auctionItems != undefined && auctionItems != []&& auctionItems?.length != 0 ){
                setAuctionItems(await auctionItems);
                console.log(await auctionItems[1]);
                setUserId(await auctionItems[0]?.userId);
            }
            
        }
    }

    const changeAuctionItemVisibility = async ()=>{
        const options = {
            method: 'PUT',
            headers: {"Authorization": `Bearer ${cookies.token}`}
        }

        var search = await fetch("https://horsetradingapidev.azurewebsites.net/api/AuctionItems/Visibility/"+selectedRowValue.id,options);
        var data = await search.json();
        if(data?.status == "Ok"){
            await fetchAuctionItems();
            resetValues();
        }
        else{
            setMessage(data?.message);
        }
    }

    const modifyAuctionItem = async()=>{
        try{
            if(titleModify != "" && descriptionModify != "" && closingTimeModify != ""){
                
                const options = {
                    method:'PUT',
                    headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${cookies.token}` },
                    body:JSON.stringify({
                        Title: titleModify,
                        Description:descriptionModify,
                        ClosingTime: closingTimeModify,
                        Visible: visible,
                        typeId: auctionItemTypeModify,
                        raiseClosingTimeInterval: selectedRowValue.raiseClosingTimeInterval
                        
                    })
                }

                //Tarkistaa että auctionitem joka on jo ei tule enään muokatuksi
                if( moment(new Date().getTime()).isAfter(moment(pastClosingTimeModify))){
                    setMessage("Cannot modify closed auctionitem");
                }
                else{
                    var search = await fetch("https://horsetradingapidev.azurewebsites.net/api/AuctionItems/"+selectedRowValue.id, options);
                    var answer = await search.json();
                    if(answer?.status == "Ok" && imageFiles != null){
                        postImages(answer.message);
                    }
                    else{
                        await fetchAuctionItems();
                        resetValues();
                    }
                }
            }
        }
        catch(e){
            console.log(e);
        }
    }

    const deleteAuctionItem= async()=>{
        if(auctionItemDeleteModal == true){
            try{
                const options = {
                    method: 'DELETE',
                    headers: {"Authorization": `Bearer ${cookies.token}`}
                }
                
                var search = await fetch("https://horsetradingapidev.azurewebsites.net/api/AuctionItems/"+selectedRowValue.id,options);
                var data = await search.json();
                if(data?.status == "Ok"){
                    await fetchAuctionItems();
                    resetValues();
                }
            }
            catch(e){

            }
        }
    }


    //Images CRUD
    const postImages = async (auctionItemId)=>{
        if(auctionItemId != undefined && auctionItemId != 0){
            const uploadPromises = imageFiles.map( async (file)=>{

                const formData = new FormData();
                    formData.append("ImageFile",file);

                const options = {
                    method: 'POST',
                    headers: {"Authorization": `Bearer ${cookies.token}`},
                    body:formData
                }

                var search = await fetch("https://horsetradingapidev.azurewebsites.net/api/Images/"+auctionItemId,options);
            });

            Promise.all(uploadPromises).then(async ()=>{
                await fetchAuctionItems();
                resetValues();
            });
        }
        else{
            setMessage(auctionItemId);
        }
    }

    const fetchImages = async()=>{
        const options = {
            method: 'GET',
            headers: {"Authorization": `Bearer ${cookies.token}`}
        }
        var search = await fetch("https://horsetradingapidev.azurewebsites.net/api/Images/"+selectedRowValue.id,options);
        var result = await search.json();
        if(result?.status != "Error" && result != undefined && result?.status != 404&& result?.status != 401&& result?.status != 403&& result?.status != 500){
            setSelectedImages(await result);
        }
    }

    const deleteSelectedImage = async(imageUrl)=>{
        const options = {
            method: 'DELETE',
            headers: {"Authorization": `Bearer ${cookies.token}`}
        }
        var search = await fetch("https://horsetradingapidev.azurewebsites.net/api/Images/?ImageUrl="+imageUrl,options);
        var result = await search.json();
        if(result?.status == "Ok"){
            setSelectedImages([]);
            await fetchImages();
        }
    }

    
    useEffect(()=>{
        if(auctionItemModifyModal == true){
            fetchImages();
        }
    },[auctionItemModifyModal]);

    useEffect(()=>{
        checkLoginStatus();
        fetchAuctionItems();
        postUsersBills();
    },[]);

    const renderImages = selecetdImages.map((e)=>{
        return(<div>
            <img className='renderedImage' src={e}/>
            <CloseButton variant="white" onClick={()=>{deleteSelectedImage(e);}}></CloseButton>
        </div>)
    });

    const changeRowColor = (rowProps) => {
        if(rowProps.data.paid == 0) {
            rowProps.style.background = '#EB4242';
        } else (
            rowProps.style.background = '#00FF00'
        )
    }

    return(
    <div className='auctionControllerMainDiv'>
        {loggedIn == true ? 
            <div>
                <h1>Auction controller</h1>
                <a href={'user/?userId='+userId}>Go to profile</a>
                <div className='auctionControllerContentMainDiv'>
                    <div>
                        <h2>Auction Items</h2>
                        <div>
                            <ReactDataGrid
                                idProperty="id"
                                style={{minHeight: 43+ 40 * auctionItems?.length, minWidth: 500 }}
                                columns={auctionItemsColumns}
                                dataSource={auctionItems}
                                defaultSortInfo={[{name: "closingTime",  dir: -1, type: 'date'},{name: "visible",  dir: -1, type: 'date'}]}
                                onSelectionChange={onSelectionChange}
                                enableSelection={true}
                                sortable={false}
                                showColumnMenuTool={false}
                            />
                        </div>
                        <div>
                            <div className='auctionControllerButtonsDiv'>
                                <Button variant="primary" onClick={()=>{setAuctionItemPostModal(true);}}>Add auctionitem</Button>
                                <Button disabled={selectedRow} onClick={()=>{setAuctionItemDeleteModal(true);}}>Delete</Button>
                                <Button disabled={selectedRow} onClick={()=>{setAuctionItemModifyModal(true);}}>Modify</Button>
                                <Button disabled={selectedRow} onClick={()=>{setAuctionItemVisibilityModal(true);}}>Change visibility</Button>
                            </div>
                            <div>
                                <Modal show={auctionItemDeleteModal} >

                                    <Modal.Header className="ModalHeader" >
                                        <Modal.Title>Are you sure you want to delete the auctionitem</Modal.Title>
                                        <CloseButton variant="white" className='modalCloseButton' onClick={()=>{setAuctionItemDeleteModal(false);}}></CloseButton>
                                    </Modal.Header>

                                    <Modal.Body className="ModalBody">
                                        <h3>This will delete the auctionitem, photos and auctioneers linked to this post <b>permanently.</b></h3>
                                    </Modal.Body>
                                    
                                    <Modal.Footer className="ModalFooter">
                                        <p className='errorMessage'>{message}</p>
                                        <Button variant="secondary" onClick={()=>{setAuctionItemDeleteModal(false);}}>
                                            Cancel
                                        </Button>
                                        <Button variant="primary" onClick={()=>{deleteAuctionItem()}}>
                                            Delete
                                        </Button>
                                    </Modal.Footer>
                                </Modal>
                            </div>

                            <div>
                                <Modal show={auctionItemPostModal} >
                                    <form>

                                        <Modal.Header className="ModalHeader" >
                                            <Modal.Title>Add auctionitem</Modal.Title>
                                            <CloseButton variant="white" className='modalCloseButton' onClick={()=>{setAuctionItemPostModal(false);}}></CloseButton>
                                        </Modal.Header>

                                        <Modal.Body className="ModalBody">
                                        <div className='controllerFormInputs'>
                                            <Form.Label>Title</Form.Label>
                                            <Form.Control placeholder='Title' onBlur={(e)=>{setTitle(handleInputChange(e));}} />
                                        </div>

                                        <div>
                                            <Form.Label>Description</Form.Label>
                                            <Form.Control as="textarea" placeholder='Description' onBlur={(e)=>{setDescription(handleInputChange(e));}} />
                                        </div>

                                        <div className='controllerFormInputs'>
                                            <Form.Label >Visible</Form.Label>
                                            <Form.Select value={visible} onChange={(e)=>{setVisible(e.target.value);}} >
                                                <option value={1}>true</option>
                                                <option value={0}>false</option>
                                            </Form.Select>
                                        </div>

                                        <div className='controllerFormInputs'>
                                            <Form.Label >Type</Form.Label>
                                            <Form.Select value={auctionItemType} onChange={(e)=>{setAuctionItemType(e.target.value);}} >
                                                <option value={1}>Commission</option>
                                                <option value={2}>Purchase</option>
                                            </Form.Select>
                                        </div>
                                        <div className='controllerFormInputs'>
                                            <Form.Label>Starting Price</Form.Label>
                                            <Form.Control placeholder='0€' type='number' onBlur={(e)=>{setStartingPrice(handleInputChange(e));}} />
                                        </div>
                                        <div className='controllerFormInputs'>
                                            <Form.Label>Closing time raise period</Form.Label>
                                            <Form.Control placeholder='0 minutes' type='number' max={60} onBlur={(e)=>{setAuctionItemRaisePeriod(handleInputChange(e));}} />
                                            <Form.Text>
                                                When the auction is about to close, this amount of minutes will be added to the timer when an offer is made.
                                            </Form.Text>
                                        </div>
                                        <div className='controllerFormInputs'>
                                            <Form.Label>Closing time</Form.Label>
                                            <Datetime 
                                                displayTimeZone={"Europe/Helsinki"}
                                                onChange={(e)=>{setClosingTime(e._d);}}
                                            />
                                            <Form.Text>
                                                Set when the auction bidding will close.
                                            </Form.Text>
                                        </div>


                                        <div>
                                            <input onChange={(e)=>{setFileFromInput(e);}} type={"file"} accept={'image/*'} id={"image-uploader"} className={"form-control"+applyErrorClass("imageSource")} multiple></input>
                                        </div>

                                        </Modal.Body>
                                        
                                        <Modal.Footer className="ModalFooter">
                                        <p className='errorMessage'>{message}</p>
                                            <Button variant="secondary" onClick={()=>{resetValues()}}>
                                                Close
                                            </Button>
                                            <Button variant="primary" onClick={()=>{postAuctionItem()}}  >  
                                            {/*  */}
                                                Save
                                            </Button>
                                        </Modal.Footer>
                                    </form>
                                </Modal>
                            </div>

                            <div>
                                <Modal show={auctionItemModifyModal} >

                                    <Modal.Header className="ModalHeader">
                                        <Modal.Title>Modify auctionitem</Modal.Title>
                                        <CloseButton variant="white" className='modalCloseButton' onClick={()=>{setAuctionItemModifyModal(false);}}></CloseButton>
                                    </Modal.Header>

                                    <Modal.Body className="ModalBody">
                                    <div className='controllerFormInputs'>
                                        <Form.Label>Title</Form.Label>
                                        <Form.Control value={titleModify} placeholder='Title' onChange={(e)=>{setTitleModify(handleInputChange(e));}} />
                                    </div>

                                    <div>
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control as="textarea" value={descriptionModify} placeholder='Description' onChange={(e)=>{setDescriptionModify(handleInputChange(e));}} />
                                    </div>

                                    <div className='controllerFormInputs'>
                                        <Form.Label >Visible</Form.Label>
                                        <Form.Select value={visible} onChange={(e)=>{setVisible(e.target.value);}} >
                                            <option value={1}>true</option>
                                            <option value={0}>false</option>
                                        </Form.Select>
                                    </div>

                                    <div className='controllerFormInputs'>
                                        <Form.Label >Type</Form.Label>
                                        <Form.Select value={auctionItemType} onChange={(e)=>{setAuctionItemType(e.target.value);}} >
                                            <option value={1}>Commission</option>
                                            <option value={2}>Purchase</option>
                                        </Form.Select>
                                    </div>

                                    <div className='controllerFormInputs'>
                                        <Form.Label >Closing time</Form.Label>
                                        <Datetime 
                                            displayTimeZone={"Europe/Helsinki"}
                                            initialViewDate={closingTimeModify}
                                            onChange={(e)=>{setClosingTimeModify(e._d);}}
                                        />
                                        <Form.Text>
                                        Set when the auction bidding will close.
                                        </Form.Text>
                                    </div>

                                    <div>
                                        <input onChange={(e)=>{setFileFromInput(e);}} type={"file"} accept={'image/*'} id={"image-uploader"} className={"form-control"+applyErrorClass("imageSource")} multiple></input>
                                    </div>

                                    <div className='auctionControllerModifyImagesDiv'>
                                        {renderImages}
                                    </div>
                                    </Modal.Body>
                                    
                                    <Modal.Footer className="ModalFooter">
                                    <p className='errorMessage'>{message}</p>
                                        <Button variant="secondary" onClick={()=>{setAuctionItemModifyModal(false)}}>
                                            Close
                                        </Button>
                                        <Button variant="primary" onClick={()=>{modifyAuctionItem()}}>
                                            Save
                                        </Button>
                                    </Modal.Footer>
                                </Modal>
                            </div>
                        
                            <div>
                                <Modal show={auctionItemVisibilityModal}>
                                    <Modal.Header className="ModalHeader">
                                        <Modal.Title>Change visibility</Modal.Title>
                                        <CloseButton variant="white" className='modalCloseButton' onClick={()=>{setAuctionItemVisibilityModal(false);}}></CloseButton>
                                    </Modal.Header>
                                    <Modal.Body className="ModalBody" >
                                        <p>Are you sure you want to change the auctionitems visibility?</p>
                                        <p>If the auctionitem is not visible it cannot be accessed by customers, or seen on the platform.</p>
                                    </Modal.Body>
                                    <Modal.Footer className="ModalFooter">
                                        <Button onClick={()=>{resetValues();}}>Close</Button>
                                        <Button onClick={()=>{changeAuctionItemVisibility();}}>Save</Button>
                                    </Modal.Footer>
                                </Modal>
                            </div>
                        </div>
                    </div>
                    <div className='auctionControllerBillsReactDataGridDiv'>
                        <h2>Bills</h2>
                        <p>All bills are sent to your email address</p>
                        <ReactDataGrid
                            idProperty="id"
                            className='auctionControllerBillsReactDataGrid'
                            style={{ minHeight: 43+ 40 * usersBills?.length }}
                            columns={billsColumns}
                            dataSource={usersBills}
                            defaultSortInfo={[{name: "paid",  dir: -1, type: 'number'},{name: "billDate",  dir: -1, type: 'date'}]}
                            onSelectionChange={onSelectionChange}
                            onRenderRow={changeRowColor}
                            enableSelection={false}
                            sortable={false}
                            showColumnMenuTool={false}
                            />
                        <p>{billsMessage}</p>
                    </div>
                </div>
            </div>
            :
            <div className='auctionControllerLoginMainDiv'>
                <p>You dont have authorization to be here</p>
                <div>
                        <div>
                            <Button variant="primary" onClick={()=>{setLoginVisibilityModal(true);}}>
                                login
                            </Button>

                            <Modal className='auctionControllerLoginModal' show={loginVisibilityModal} >

                                <Modal.Header className="ModalHeader" >
                                    <Modal.Title>Login</Modal.Title>
                                    <CloseButton variant="white" className='modalCloseButton' onClick={()=>{setLoginVisibilityModal(false);}}></CloseButton>
                                </Modal.Header>

                                <Modal.Body className="ModalBody">
                                <div className='controllerFormInputs'>
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control placeholder='Email' value={email} onChange={(e)=>{setEmail(handleInputChange(e));}} />
                                </div>

                                <div className='controllerFormInputs'>
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" placeholder='Password' value={password} onChange={(e)=>{setPassword(handleInputChange(e));}} />
                                    <Form.Text className="text-muted">
                                        Logging in is only available for administrators
                                    </Form.Text>
                                
                                    <p className='errorMessage'>{message}</p>
                                </div>


                                </Modal.Body>
                                
                                <Modal.Footer className="ModalFooter">
                                    <Button variant="secondary" onClick={()=>{setLoginVisibilityModal(false); }}>
                                        Close
                                    </Button>
                                    <Button variant="primary" onClick={()=>{handleLogin()}}>
                                        Login
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </div>
                    </div>
            </div>}
       
    </div>);
}

export{AuctionController}