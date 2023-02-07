let webmap_appname = "KR_ALOA";
let webmap_layout_file = "lbslayout.xml";
let webmap_server_url;
let webmap_server_ext;

class MapModule 
{
    constructor() 
    {
        this.module = null;
        this.loadedWasm = false;
        this.toUpdateScreen = false;
        this.defaultW = 0;
        this.defaultH = 0;
        this.defaultPosX = 0;
        this.defaultPosY = 0;
        this.defaultLevel = -1;
        
        webmap_appname = WEBMAP_CONFIG.name;
        webmap_layout_file = WEBMAP_CONFIG.layout_file;
        webmap_server_url = WEBMAP_URL.server_url;
        webmap_server_ext = WEBMAP_URL.server_ext;
    }
    
    setModule(module) 
    {
        this.module = module;
    }

    setLoadedWasm(loaded) 
    {
        this.loadedWasm = loaded;
        
        if(loaded)
        {
            if((this.defaultW != 0) && (this.defaultH != 0))
            {
                this.setScreen(this.defaultW, this.defaultH);
            }
            if((this.defaultPosX != 0) || (this.defaultPosY != 0))
            {
                this.setCenterFocus(this.defaultPosX, this.defaultPosY, this.defaultLevel);
            }

            const xmlhttpRequest = new XMLHttpRequest();
            xmlhttpRequest.open("GET", webmap_layout_file, false);
            xmlhttpRequest.send();
            if(xmlhttpRequest.status === 200)
            {
                var layoutBuffer = new XMLSerializer().serializeToString(xmlhttpRequest.responseXML);
                this.loadMapLayout(layoutBuffer);
                console.log("::::Loaded MapLayout");
            }
            else
            {
                console.log("::::Failed to layout_file ("+ webmap_layout_file + ")");
            }
        }
    }

    loadMapLayout(layoutBufferData)
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module.ccall('loadMapLayout', null, ['string'], [layoutBufferData]);
        }
    }

    getLoadedWasm()
    {
        return this.loadedWasm;
    }
    
    //-----------------------------------------------------------------------------------------------------------------
    //* Map infors
    setLockMapScreen = function (bLock) //false:unlock, true:lock
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module._setLockMapScreen(bLock); 
        }
    }

    getLockMapScreen = function () //false:unlock, true:lock
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            return this.module._getLockMapScreen(); 
        }
        return false;
    }

    setLockMapKeyInput = function (bLock) //false:unlock, true:lock
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module._setLockMapKeyInput(bLock); 
        }
    }

    getClientVersion = function ()
    {
        var clientVersion;

        if((this.module != null) && (this.loadedWasm == true))
        {
            clientVersion = this.module._getClientVersion(); 
        }
        else
        {
            clientVersion = "ver0.00.000";
        }
        
        return UTF8ToString(clientVersion);
    }

    getMemoryUsage = function (opt) //opt:1 to 4, return json format, ({cnt:0,byte:0})
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            return eval(this.module.ccall('getMemoryUsage', 'string', ['number'], [opt])); 
        }
        return {cnt:0,byte:0};
    }

    setUseLastPos = function(bUse) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module._setUseLastPos(bUse);
        }
    }

    getDistance = function(x1, y1, x2, y2) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            return this.module._getDistance(x1, y1, x2, y2); 
        }
        return 0.0;
    }


    //-----------------------------------------------------------------------------------------------------------------
    //* Map control
    setScreen = function (w, h) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module._setScreen(w, h);
        }
        else
        {
            this.defaultW = w;
            this.defaultH = h;
        }
    }
    
    setCenterFocus = function (x, y, zoomlvl=-1, bStepMove=false) //zoomlvl : -1(None), 0~10 will be validate
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module._centerFocus(x, y, zoomlvl, (bStepMove==true)?1:0); 
            //this.toUpdateScreen = true;
        }
        else
        {
            this.defaultPosX = x;
            this.defaultPosY = y;
            this.defaultLevel = zoomlvl;
        }
    }
    
    getCenter = function () 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            return eval(this.module.ccall('getCenter', 'string', [], [])); 
        }
        return {dx:0.0,dy:0.0};
    }
    
    setZoomIn = function () 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module._zoomIn();
            this.toUpdateScreen = true;
        }
    }

    setZoomOut = function () 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module._zoomOut();
            this.toUpdateScreen = true;
        }
    }

    canvasZoomStart = function () 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module._canvasZoomStart(); 
        }
    }
    canvasZoomEnd = function ()
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module._canvasZoomEnd(); 
        }
    }

    canvasZoomIn = function () 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module._canvasZoomIn();
        }
    }

    canvasZoomOut = function () 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module._canvasZoomOut();
        }
    }

    setZoomLevel = function (targetZoom, bStepZoom) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module._setZoomLevel(targetZoom, (bStepZoom==true)?1:0 ); 
        }
    }

    getZoomLevel = function () 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            return eval(this.module._getZoomLevel()); 
        }
        return 0;
    }

    setZoomBound = function (x1, y1, x2, y2, offsetX, offsetY, bStepZoom) //2019.11.05 added. Name Changed.. 
    {
        if((this.module != null) && (this.loadedWasm == true))
        { 
            this.module._setZoomMapByWorldMBR(x1, y1, x2, y2, offsetX, offsetY, (bStepZoom==true)?1:0);
        }
    }

    setZoomBound2 = function (x1, y1, x2, y2, paddingL, paddingT, paddingR, paddingB, bStepZoom)
    {
        if((this.module != null) && (this.loadedWasm == true))
        { 
            this.module._setZoomMapByWorldMBR2(x1, y1, x2, y2, paddingL, paddingT, paddingR, paddingB, (bStepZoom==true)?1:0);
        }
    }
    
    getZoomBound = function () 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            return eval(this.module.ccall('getZoomBound', 'string', [], [])); 
        }
        return {left:0.0,top:0.0,right:0.0,bottom:0.0};
    }

    world2screen = function (x, y) // world2screen in c++ function returns a json format text as result  ({x:%d,y:%d})
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            return eval(this.module.ccall('world2screen', 'string', ['number', 'number'], [x, y])); 
        }
        return {x:0,y:0};
    }

    screen2world = function (x, y) // screen2world in c++ function returns a json format text as result  ({x:%d,y:%d})
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            return eval(this.module.ccall('screen2world', 'string', ['number', 'number'], [x, y])); 
        }
        return {x:0.0,y:0.0};
    }

    redrawMap = function () 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.toUpdateScreen = true; 
        }
    }

    renderMap = function () 
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module._renderMap(this.toUpdateScreen);
            this.toUpdateScreen = false;
        }
    }
    
    onUnload = function () 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module._onUnload();
        }
    }

    setShowCenterMark = function (bshow) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setShowCenterMark', 'number', ['number'], [bshow]); 
        }
    }

    //Only ALOA...
    setImageMask = function (bCheck) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setImageMask', 'number', ['number'], [bCheck]); 
        }
    }
    setImageMaskLabel = function (bCheck) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setImageMaskLabel', 'number', ['number'], [bCheck]); 
        }
    };
    setLineVisibleLimit = function (bCheck) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setLineVisibleLimit', 'number', ['number'], [bCheck]); 
        }
    };
    setMoveDrawUserImage = function (bCheck) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setMoveDrawUserImage', 'number', ['number'], [bCheck]); 
        }
    };
    setMoveDrawUserText = function (bCheck) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setMoveDrawUserText', 'number', ['number'], [bCheck]); 
        }
    };
    setMoveDrawUserPoly = function (bCheck) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setMoveDrawUserPoly', 'number', ['number'], [bCheck]); 
        }
    };
    //...Only ALOA
    
    //-----------------------------------------------------------------------------------------------------------------
    //* User Image
    //the urldir below have to be set the same host as wasm. if not it will be occurred weird?? security issue.
    //align:11(LT), 21(CT), 31(RT) | 12(LC), 22(CC), 32(RC) | 13(LB), 23(CB), 33(RB)
    loadImageFrUrl = function (urldir, filename) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('loadMapImageFromUrl', 'number', ['string', 'string'], [urldir, filename]); 
        }
    }

    addOnMapImage = function (urldir, filename, tagName, x, y, w, h, align, bzoom, bshow, bBoundaryCheck=false) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setMapImageFromUrl', 'number', ['string', 'string', 'string', 'number', 'number', 'number', 'number', 'number', 'number', 'number','number', 'number', 'number', 'number', 'number'], [urldir, filename, tagName, x, y, w, h, 0, 0, 0, 0, align, bzoom, bshow, (bBoundaryCheck==true)?1:0]); 
        }
    }

    addOnMapImage2 = function (urldir, filename, tagName, x, y, w, h, paddingL, paddingT, paddingR, paddingB, align, bzoom, bshow, bBoundaryCheck=false) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setMapImageFromUrl', 'number', ['string', 'string', 'string', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number','number', 'number', 'number', 'number'], [urldir, filename, tagName, x, y, w, h, paddingL, paddingT, paddingR, paddingB, align, bzoom, bshow, (bBoundaryCheck==true)?1:0]); 
        }
    }

    addOnMapImageLabel = function (urldir, filename, tagName, x, y, w, h, text, ftsize, r, g, b, bshow, bBoundaryCheck=false) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setMapImageLabelFromUrl', 'number', ['string', 'string', 'string', 'number', 'number', 'number', 'number', 'string', 'number', 'number', 'number', 'number', 'number', 'number'], [urldir, filename, tagName, x, y, w, h, text, ftsize, r, g, b, bshow, (bBoundaryCheck==true)?1:0]); 
        }
    }

    setShowImageByUserTag = function (tagName, bshow) //if tag is "" then all of image will be affected by bshow flag
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setShowImageByTag', 'number', ['string', 'number'], [tagName, bshow]); 
        }
    }

    setImageShowLevelByTag = function (tagName, nFr, nTo) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setImageShowLevelByTag', 'number', ['string', 'number', 'number'], [tagName, nFr, nTo]); 
        }
    }

    setImageMapPositionByTag = function (tagName, wgsX, wgsY) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setImageMapPositionByTag', 'number', ['string', 'number', 'number'], [tagName, wgsX, wgsY]); 
        }
    }

    setImageRoateByTag = function (tagName, fangle) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setImageRoateByTag', 'number', ['string', 'number'], [tagName, fangle]); 
        }
    }

    setImageLabelTagName = function (tagNameImg, tagNameLbl) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setImageLabelTagName', 'number', ['string', 'string'], [tagNameImg, tagNameLbl]); 
        }
    }

    setImageMask = function (bCheck) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setImageMask', 'number', ['number'], [bCheck]); 
        }
    }

    setImageMaskLabel = function (bCheck) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setImageMaskLabel', 'number', ['number'], [bCheck]); 
        }
    }

    setMoveDrawUserImage = function (bCheck) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setMoveDrawUserImage', 'number', ['number'], [bCheck]); 
        }
    }

    getImageMapPositionByTag = function (tagName) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            return eval(this.module.ccall('getImageMapPositionByTag', 'string', ['string'], [tagName])); 
        }
    }

    hitImageMapPositionByScrPoint  = function (scrX, scrY) //use result.tag 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            return eval(this.module.ccall('hitImageMapPositionByScrPoint', 'string', ['number', 'number'], [scrX, scrY])); 
        }
        return {tag:null};
    }

    hitImageMapPositionsByScrPoint = function (scrX, scrY) //use result.tags
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            return eval(this.module.ccall('hitImageMapPositionsByScrPoint', 'string', ['number', 'number'], [scrX, scrY])); 
        }
        return {tags:null};
    }

    deleteImageByTag = function (tagName) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('deleteImageByTag', 'string', ['string'], [tagName]); 
        }
    }


    //-----------------------------------------------------------------------------------------------------------------
    //* User Label
    addOnMapLabel = function (tagName, x, y, text, ftsize, xoff, yoff, r, g, b, bshow) //center align.
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setMapUserLabel', 'number', ['string', 'number', 'number', 'string', 'number', 'number', 'number', 'number', 'number', 'number', 'number'], [tagName, x, y, text, ftsize, xoff, yoff, r, g, b, bshow]); 
        }
    }

    setShowLabelByUserTag = function (tagName, bshow) //if tag is "" then all of labels will be affected by bshow flag
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setShowLabelByUserTag', 'number', ['string', 'number'], [tagName, bshow]); 
        }
    }

    setMoveDrawUserText = function (bCheck) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setMoveDrawUserText', 'number', ['number'], [bCheck]); 
        }
    }

    deleteLabelByTag = function (tagName) //if tag is "" then all of labels will be affected by bshow flag
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('deleteLabelByTag', 'string', ['string'], [tagName]); 
        }
    }
    

    //-----------------------------------------------------------------------------------------------------------------
    //* User Draw
    addRouteLine = function (routeTag, arrN32Data, width, byR, byG, byB) //x, y
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            var arrN32DataBuffer = Module._malloc(4 * arrN32Data.length);
            Module.HEAP32.set(arrN32Data, arrN32DataBuffer>>2);
            this.module.ccall('addNewPolyItem', 'number', ['string', '[number]','number','number','number','number','number','number','number','number'], [routeTag, arrN32DataBuffer, arrN32Data.length, 3, width, byR, byG, byB, 255, -1]);
            Module._free(arrN32DataBuffer);
        }
    }

    addRouteLineEx = function (routeTag, arrN32Data, width, dotSpace, byR, byG, byB) //x, y
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            var arrN32DataBuffer = Module._malloc(4 * arrN32Data.length);
            Module.HEAP32.set(arrN32Data, arrN32DataBuffer>>2);
            this.module.ccall('addNewPolyItem', 'number', ['string', '[number]','number','number','number','number','number','number','number','number'], [routeTag, arrN32DataBuffer, arrN32Data.length, 5, width, byR, byG, byB, 255, dotSpace]);
            Module._free(arrN32DataBuffer);
        }
    }

    addOnMapPolyline = function (polylineTag, arrN32Data, width, byR, byG, byB, byA=100) //x, y
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            var arrN32DataBuffer = Module._malloc(4 * arrN32Data.length);
            Module.HEAP32.set(arrN32Data, arrN32DataBuffer>>2);
            this.module.ccall('addNewPolyItem', 'number', ['string', '[number]','number','number','number','number','number','number','number','number'], [polylineTag, arrN32DataBuffer, arrN32Data.length, 1, width, byR, byG, byB, byA, -1]);
            Module._free(arrN32DataBuffer);
        }
    }

    addOnMapPolygon = function (polygonTag, arrN32Data, byR, byG, byB, byA) //x, y
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            var arrN32DataBuffer = Module._malloc(4 * arrN32Data.length);
            Module.HEAP32.set(arrN32Data, arrN32DataBuffer>>2);
            this.module.ccall('addNewPolyItem', 'number', ['string', '[number]','number','number','number','number','number','number','number','number'], [polygonTag, arrN32DataBuffer, arrN32Data.length, 2, 0, byR, byG, byB, byA, -1]);
            Module._free(arrN32DataBuffer);
        }
    }

    addOnMapDashline = function (polylineTag, arrN32Data, width, byR, byG, byB, byA) //x, y
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            var arrN32DataBuffer = Module._malloc(4 * arrN32Data.length);
            Module.HEAP32.set(arrN32Data, arrN32DataBuffer>>2);
            this.module.ccall('addNewPolyItem', 'number', ['string', '[number]','number','number','number','number','number','number','number','number'], [polylineTag, arrN32DataBuffer, arrN32Data.length, 4, width, byR, byG, byB, byA, -1]);
            Module._free(arrN32DataBuffer);
        }
    }

    setPolyItem = function (routeTag, nJob, w, r, g, b, a) //-1:Delete, 0:Hide, 1:Show, 2:Change width&color
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module.ccall('setPolyItem', 'number', ['string', 'number','number','number','number','number','number'], [routeTag, nJob, w, r, g, b, a]);
        }
    }

    hitPolygonTestByScrPoint = function (scrX, scrY) //use result.tag 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            return eval(this.module.ccall('hitPolygonTestByScrPoint', 'string', ['number', 'number'], [scrX, scrY])); 
        }
        return {tag:null};
    }

    hitPolygonTestByWorldPoint = function (wgsX, wgsY) //use result.tag 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            return eval(this.module.ccall('hitPolygonTestByWorldPoint', 'string', ['number', 'number'], [wgsX, wgsY])); 
        }
        return {tag:null};
    }
    

    //-----------------------------------------------------------------------------------------------------------------
    //* Map Geometry
    //-----------------------------------------------------------------------------------------------------------------
    getZonePolygon = function (arrN32Data, expandMeter) //x, y
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module.ccall('initZonePolyPt', 'number', ['number'], [arrN32Data.length]);
            for (var i = 0; i < arrN32Data.length; i += 2) 
            {
                this.module.ccall('addZonePolyPt', 'number', ['number','number'], [arrN32Data[i], arrN32Data[i + 1]]);
            }
            return eval(this.module.ccall('getZonePolygon', 'string', ['number'], [expandMeter]));
        }
        return {};
    }

    getMinPtDistanceOnPolyline = function (arrN32Data, dx, dy) //JSon Result : ({dist:\"%f\"}) //about 1 Meter
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module.ccall('initPolyMathPt', 'number', ['number'], [arrN32Data.length]);
            for (var i = 0; i < arrN32Data.length; i += 2) 
            {
                this.module.ccall('addPolyMathPt', 'number', ['number','number'], [arrN32Data[i], arrN32Data[i + 1]]);
            }
            return eval(this.module.ccall('getMinPtDistanceOnPolyline', 'string', ['number','number'], [dx, dy]));
        }
        return {dist:'0.0'};
    }

    getPointAngleOnPolylineByUnit = function (arrN32Data, dTotalUnitOfLine, dUnitOfLine) //({dx:%3.5f,dy:%3.5f,angle:%1.1f})
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module.ccall('initPolyMathPt', 'number', ['number'], [arrN32Data.length]);
            for (var i = 0; i < arrN32Data.length; i += 2) 
            {
                this.module.ccall('addPolyMathPt', 'number', ['number','number'], [arrN32Data[i], arrN32Data[i + 1]]);
            }
            return eval(this.module.ccall('getPointAngleOnPolylineByUnit', 'string', ['number', 'number'], [dTotalUnitOfLine, dUnitOfLine]));
        }
        return {dx:0.0,dy:0.0,angle:0.0};
    }

    getBorderOfPolygon = function (arrN32Data, expandMeter) 
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module.ccall('initBorderPolyPt', 'number', ['number'], [arrN32Data.length]);
            for (var i = 0; i < arrN32Data.length; i += 2) 
            {
                this.module.ccall('addBorderPolyPt', 'number', ['number','number'], [arrN32Data[i], arrN32Data[i + 1]]);
            }
            return eval(this.module.ccall('getBorderOfPolygon', 'string', ['number'], [expandMeter]));
        }
        return {};
    }
    
    getCurveOfPolygon = function (arrN32Data, expandMeter) 
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module.ccall('initCurvePolyPt', 'number', ['number'], [arrN32Data.length]);
            for (var i = 0; i < arrN32Data.length; i += 2) 
            {
                this.module.ccall('addCurvePolyPt', 'number', ['number','number'], [arrN32Data[i], arrN32Data[i + 1]]);
            }
            return eval(this.module.ccall('getCurveOfPolygon', 'string', ['number'], [expandMeter]));
        }
        return {};
    }

    setLineVisibleLimit = function (bCheck) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setLineVisibleLimit', 'number', ['number'], [bCheck]); 
        }
    }

    setMoveDrawUserPoly = function (bCheck) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setMoveDrawUserPoly', 'number', ['number'], [bCheck]); 
        }
    }
    

    //-----------------------------------------------------------------------------------------------------------------
    //* Extend Layer
    setShowPostArea = function (bshow) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setShowPostArea', 'number', ['number'], [bshow]); 
        }
    }

    setStylePostArea = function ( lineStyle, lineWidth, lineSpace, lineR, lineG, lineB, lineA, fontR, fontG, fontB )
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module.ccall('setStylePostArea', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'], [lineStyle, lineWidth, lineSpace, lineR, lineG, lineB, lineA, fontR, fontG, fontB]);
        }
    }

    setShowRegionSiGunGu = function (bshow) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setShowRegionSiGunGu', 'number', ['number'], [bshow]); 
        }
    }

    setStyleRegionSiGunGu = function ( lineStyle, lineWidth, lineSpace, lineR, lineG, lineB, lineA, fontR, fontG, fontB )
    {
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module.ccall('setStyleRegionSiGunGu', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'], [lineStyle, lineWidth, lineSpace, lineR, lineG, lineB, lineA, fontR, fontG, fontB]);
        }
    }

    setShowTraffic = function (bshow) 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            var nResult = this.module.ccall('setShowTraffic', 'number', ['number'], [bshow]); 
        }
    }

    updateTraffic = function () 
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module._updateTraffic(); 
        }
    }

    //-----------------------------------------------------------------------------------------------------------------
    //* Event Handler
    mouseLButtonDoubleClick = function (mouseX, mouseY)
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module._mouseLButtonDoubleClick(mouseX, mouseY);
        }
    }

    mouseLButtonDown = function (mouseX, mouseY)
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module._mouseLButtonDown(mouseX, mouseY);
        }
    }

    mouseLButtonUp = function ()
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module._mouseLButtonUp();
        }
    }

    mouseMove = function (mouseX, mouseY)
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module._mouseMove(mouseX, mouseY);
        }
    }

    mouseWheel = function (deltaY)
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module._mouseWheel(deltaY);
        }
    }

    resizeScreen = function (cx, cy)
    { 
        if((this.module != null) && (this.loadedWasm == true))
        {
            this.module._resizeScreen(cx, cy);
        }
    }
};

var mapModule = new MapModule();
