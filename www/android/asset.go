package androidPackage

import (
	"os"
	"u9/models"
	"fmt"
	"github.com/astaxie/beego"
	"encoding/json"
	"github.com/astaxie/beego/config"
)

type Asset struct {
	product      *models.Product
	packageParam *models.PackageParam

	packagePath string
}

func NewAsset(packageTaskId int, product *models.Product, productVersion *models.ProductVersion,
	packageParam *models.PackageParam) *Asset {
	ret := new(Asset)
	ret.product, ret.packageParam = product, packageParam

	apkName := GetApkName(product, productVersion)
	ret.packagePath = GetPackagePath(packageTaskId, apkName)

	return ret
}

func (this *Asset) Handle() {
	this.clear()
	this.setHyGameJson() //5、生成json文件
	this.setChannel()
}

func (this *Asset) clear() {
	//7、移除非渠道闪屏
	filename := "0"
	if this.product.Direction == 0 {
		filename = "1"
	}

	switchPhotoFile := this.packagePath + "/assets/splash_photo/" + filename + ".png"
	if err := os.RemoveAll(switchPhotoFile); err != nil {
		panic(err)
	}
}

func (this *Asset) setHyGameJson() {
	file, err := os.OpenFile(this.packagePath+"/"+"assets/hy_game.json", os.O_CREATE|os.O_TRUNC|os.O_RDWR, 0660)
	if err != nil {
		panic(err)
	}
	defer func() {
		file.Close()
	}()

	if _, err := file.WriteString(this.packageParam.JsonParam); err != nil {
		panic(err)
	}
}

//添加渠道特殊文件
func (this *Asset) setChannel(){
	switch this.packageParam.ChannelId{
	case 139:
		this.setTencent()
	}
}

func (this *Asset) setTencent(){
	conf := new(config.IniConfig)
	iniConfigContainer, err := conf.ParseData([]byte(""))

	if err != nil {
		fmt.Println(err)
		return
	}
	jsonParam := new(map[string]interface{})
		if err := json.Unmarshal([]byte(this.packageParam.XmlParam), jsonParam); err != nil {
			beego.Error(err)
		}
	qqAppId := (*jsonParam)["QQ_APP_ID"].(string)
	wxAppId := (*jsonParam)["WX_APP_ID"].(string)
	offerId := (*jsonParam)["OFFER_ID"].(string)
	iniConfigContainer.Set("QQ_APP_ID", qqAppId)
	iniConfigContainer.Set("WX_APP_ID", wxAppId)
	iniConfigContainer.Set("OFFER_ID", offerId)
	iniConfigContainer.Set("YSDK_URL", "https://ysdk.qq.com")
	err = iniConfigContainer.SaveConfigFile("assets/ysdkconf.ini")
	if err != nil {
		fmt.Println(err)
		return
	}
}