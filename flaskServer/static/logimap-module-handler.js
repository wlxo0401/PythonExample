//-----------------------------------------------------------------------------------------------------------------
// Variable
//-----------------------------------------------------------------------------------------------------------------
function logimap_checkUseChrome() //true(Chrome), false(others)
{
    var browser = navigator.userAgent.toLowerCase();
    return (-1 != browser.indexOf("chrome")); //"msie" //"opera"
}

function logimap_checkMobile() //true(Mobile), false(others)
{
    var filter = "win16|win32|win64|mac";
    if(navigator.platform){ return (0 > filter.indexOf(navigator.platform.toLowerCase())); }
    return false;
}

var logimap_isMobileType = {
    Android: function () {
        return navigator.userAgent.match(/Android/i) == null ? false : true;
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i) == null ? false : true;
    },
    any: function () {
        return (logimap_isMobileType.Android() || logimap_isMobileType.iOS());
    }
};

function logimap_storageAvailable(type) 
{
    var storage;
    try 
    {
        storage = (type == 1) ? window['localStorage'] : window['sessionStorage'];
        var x = '__storage_test__';
        storage.setItem(x,x);
        storage.removeItem(x);
        return true;
    } 
    catch(e) 
    {
        return e instanceof DOMException && (
            e.code === 22 || e.code === 1014 || e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_REACHED')
            && (storage && storage.length !== 0);
    }
}

function logimap_getDPI()
{ 
    return window.devicePixelRatio; 
}

//-----------------------------------------------------------------------------------------------------------------
// Initialize
//-----------------------------------------------------------------------------------------------------------------
window.addEventListener('resize', () => 
{
    if((mapModule != 'undefined') && mapModule.getLoadedWasm())
    {
        mapModule.setScreen(window.innerWidth, window.innerHeight); 
    }
    bridge_mapResized();
});
window.addEventListener('load', function() {setTimeout(logimap_init, 100);}, false);

function logimap_init()
{
    //if (!logimap_checkMobile()) alert("Note: 이 Site의 화면은 모바일 테블릿(세로모드)에 최적화 했습니다.");
    //if (!logimap_checkUseChrome()) alert("Note: 이 Site의 기능은 Chrome 브라우져에 최적화 했습니다.");

    setInterval(logimap_loopFunc, 1000 / 45);

    var el = document.getElementById("canvas"); 
    if (logimap_checkMobile())
    {
        el.addEventListener('touchstart', logimap_motionEventHandler);
        el.addEventListener('touchmove', logimap_motionEventHandler);
        el.addEventListener('touchend', logimap_motionEventHandler);
    }
    el.addEventListener('dblclick', logimap_motionEventHandler);
    el.addEventListener("wheel", logimap_motionEventHandler);
    el.addEventListener('mousedown', logimap_motionEventHandler);
    el.addEventListener('mouseup', logimap_motionEventHandler);
    el.addEventListener('mousemove', logimap_motionEventHandler);
    window.addEventListener('beforeunload', logimap_beforeunloadHandler);
}

function logimap_loopFunc()
{
    if((mapModule != 'undefined') && (mapModule.getLoadedWasm()))
    {
        mapModule.renderMap();
    }
}

function logimap_onInitJS() 
{
    console.log('>> start OnInitJS()');
    
	// 지도 상에서 표시하는 이미지를 Local Storage를 사용하지 않게 함 (libpng 오류에 대한 Work around)
    if(mapModule != 'undefined')
    {
        mapModule.setUseLastPos(false);
    }
    
    if (typeof _OnInitJS === 'function') 
    {
        _OnInitJS();
    }
    bridge_loadFinished();
    
    console.log('<< end OnInitJS()');
}

//-----------------------------------------------------------------------------------------------------------------
// Mouse & Touch Handling
//-----------------------------------------------------------------------------------------------------------------
function logimap_motionEventHandler(e) 
{
    if(this.mouseLButtonDownStatus == undefined)
    {
        this.mouseLButtonDownStatus = false;
    }
    if(this.tcpoints == undefined)
    {
        this.tcpoints = [];
    }
    if(this.prevtcpoints == undefined)
    {
        this.prevtcpoints = [];
    }
    if(this.multiTouchActive == undefined)
    {
        this.multiTouchActive = false;
    }
    
    if(mapModule != 'undefined')
    {
        if(mapModule.getLockMapScreen() == false)
        {
            if((e.type == 'touchstart') || (e.type == 'touchmove') || (e.type == 'touchend'))
            {
                if ((e.targetTouches.length <= 1) || (e.type == 'touchend'))
                {
                    this.multiTouchActive = false; 
                }
                else
                {
                    this.multiTouchActive = true;
                }

                if(e.type == 'touchstart')
                {
                    this.prevtcpoints = e.targetTouches;
                    this.tcpoints = e.targetTouches;
                    if (this.multiTouchActive) 
                    { 
                        this.mouseLButtonDownStatus = false;
                        mapModule.canvasZoomStart();
                        logimap_touchScaleEvent(this.prevtcpoints, this.tcpoints);
                    }
                    else
                    {
                        this.mouseLButtonDownStatus = true;
                        mapModule.mouseLButtonDown(this.tcpoints[0].clientX, this.tcpoints[0].clientY);
                        bridge_mapMoveStarted(e);
                    }
                } 
                else if(e.type == 'touchmove') 
                {
                    this.prevtcpoints = this.tcpoints;
                    this.tcpoints = e.targetTouches;
                    if (this.multiTouchActive) 
                    {
                        logimap_touchScaleEvent(this.prevtcpoints, this.tcpoints);
                    }
                    else
                    {
                        this.mouseLButtonDownStatus = true;
                        mapModule.mouseMove(this.tcpoints[0].clientX, this.tcpoints[0].clientY);
                        bridge_mapMoved(e);
                    }
                } 
                else if(e.type == 'touchend') 
                {
                    if (this.multiTouchActive) 
                    {
                        logimap_touchScaleEvent(this.prevtcpoints, this.tcpoints);
                    }
                    this.mouseLButtonDownStatus = false;
                    mapModule.mouseLButtonUp();
                    mapModule.canvasZoomEnd();
                    bridge_mapMoveFinished(e);
                }
            }
            else
            {
                if(e.type == 'dblclick')
                {
                    mapModule.mouseLButtonDoubleClick(e.offsetX, e.offsetY);

                    if (typeof _OnDblClick === 'function') 
                    {
                        _OnDblClick(e);
                    }
                }
                else if(e.type == 'wheel')
                {
                    mapModule.mouseWheel(e.deltaY);
                }
                else if(e.type == 'mousedown')
                {
                    if(e.buttons == 1)
                    {
                        this.mouseLButtonDownStatus = true;
                        mapModule.mouseLButtonDown(e.offsetX, e.offsetY);
                        bridge_mapMoveStarted(e);
                    }
                    else
                    {
                        this.mouseLButtonDownStatus = false;
                    }
                    
                    if (typeof _OnMouseDown === 'function') 
                    {
                        _OnMouseDown(e);
                    }
                }
                else if(e.type == 'mouseup')
                {
                    this.mouseLButtonDownStatus = false;
                    mapModule.mouseLButtonUp();
                    bridge_mapMoveFinished(e);

                    if (typeof _OnMouseUp === 'function') 
                    {
                        _OnMouseUp(e);
                    }
                }
                else if(e.type == 'mousemove')
                {
                    if(e.buttons == 1)
                    {
                        this.mouseLButtonDownStatus = true;
                        mapModule.mouseMove(e.offsetX, e.offsetY);
                        bridge_mapMoved(e);
                    }

                    if((e.buttons != 1) && (this.mouseLButtonDownStatus == true))
                    {
                        this.mouseLButtonDownStatus = false;
                        mapModule.mouseLButtonUp();
                        bridge_mapMoveFinished(e);
                    }

                    if (typeof _OnMouseMove === 'function') 
                    {
                        _OnMouseMove(e);
                    }
                }
            }
        }
    }
    e.preventDefault();
}

function logimap_touchScaleEvent(prevtcpoints, tcpoints)
{
    /* Hurrah for trigonometry */
    pre_size = Math.sqrt(Math.pow(prevtcpoints[0].clientX-prevtcpoints[1].clientX,2)+Math.pow(prevtcpoints[0].clientY-prevtcpoints[1].clientY,2));
    cur_size = Math.sqrt(Math.pow(tcpoints[0].clientX-tcpoints[1].clientX,2)+Math.pow(tcpoints[0].clientY-tcpoints[1].clientY,2));
    var el = document.getElementById("canvas"); 
    var bChk = false;

    if(mapModule != 'undefined')
    {
        if ((pre_size - cur_size) < -2) 
        {
            mapModule.canvasZoomIn();
            bridge_pinchFinished(1);
        } 
        else if ((pre_size - cur_size) > 2) 
        {
            mapModule.canvasZoomOut();
            bridge_pinchFinished(2);
        }
    }
}

function logimap_beforeunloadHandler(e)
{
    if(mapModule != 'undefined')
    {
        console.log('>> start Unload()');
        mapModule.onUnload();
        console.log('<< end Unload()');

        //종료 시점에 로그 확인용
        const wakeUpTime = Date.now() + 200;
        while (Date.now() < wakeUpTime) {}
    }
}

//-----------------------------------------------------------------------------------------------------------------
// Bridge
//-----------------------------------------------------------------------------------------------------------------
function bridge_loadFinished()
{
    if (logimap_isMobileType.any()) 
    {
        if (logimap_isMobileType.Android()) 
        {
            window.BRIDGE.loadFinished();
        } 
        else if (logimap_isMobileType.iOS()) 
        {
            window.webkit.messageHandlers.BRIDGE.postMessage("loadFinished");
        }
    }
}

function bridge_mapResized()
{
    //console.log("OnMapResized");
    if (logimap_isMobileType.any()) 
    {
        if (logimap_isMobileType.iOS()) 
        {
            window.webkit.messageHandlers.BRIDGE.postMessage("mapResize");
        }
    }
}

function bridge_mapMoveStarted(event) 
{
    if (logimap_isMobileType.any()) 
    {
        if (logimap_isMobileType.Android()) 
        {
            window.BRIDGE.mapMoveStarted();
        } 
        else if (logimap_isMobileType.iOS()) 
        {
            window.webkit.messageHandlers.BRIDGE.postMessage("mapMoveStarted");
        }
    }
}

function bridge_mapMoved(event) 
{
    if (logimap_isMobileType.any()) 
    {
        if (logimap_isMobileType.Android()) 
        {
            window.BRIDGE.mapMoved();
        } 
        else if (logimap_isMobileType.iOS()) 
        {
            window.webkit.messageHandlers.BRIDGE.postMessage("mapMoved");
        }
    }
}

function bridge_mapMoveFinished(event) 
{
    if (logimap_isMobileType.any()) 
    {
        if (logimap_isMobileType.Android()) 
        {
            window.BRIDGE.mapMoveFinished();
        } 
        else if (logimap_isMobileType.iOS()) 
        {
            window.webkit.messageHandlers.BRIDGE.postMessage("mapMoveFinished");
        }
    }
}

function bridge_pinchFinished(inPinchEventType) // 1: zoom in, 2: zoom out
{
    //console.log("[OnPinchFinished]" + inPinchEventType);
    if (logimap_isMobileType.any()) 
    {
        if (logimap_isMobileType.Android()) 
        {
            window.BRIDGE.pinchFinished();
        } 
        else if (logimap_isMobileType.iOS()) 
        {
            window.webkit.messageHandlers.BRIDGE.postMessage("pinchFinished");
        }
    }
}


//-----------------------------------------------------------------------------------------------------------------
// Module
//-----------------------------------------------------------------------------------------------------------------
var Module =
    {
        preRun: [OnBeforeWasmLoading],
        postRun: [OnAfterWasmLoading],
        canvas: (function () {
            var canvas = document.getElementById('canvas');
            canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); }, false);
            return canvas; })()
    };

mapModule.setModule(Module);

function OnBeforeWasmLoading() //Called Before loading Wasm this.module
{
	console.log("OnBeforeWasmLoading!!!");    
}

function OnAfterWasmLoading() //Called After loading Wasm this.module
{
    mapModule.setLoadedWasm(true);
    console.log("OnAfterWasmLoading!!!");
}
