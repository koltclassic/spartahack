package main

//fswebcam -r 1280x720 --no-banner foo.jpg
//35.14.148.40
import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	// "strings"

	//Third Party Packages
	"github.com/gorilla/mux"
)

var Router = new(mux.Router)
var fs http.Handler

type Results struct {
	Results []Result `json:"results"`
	Status  string   `json:"status_code"`
}

type Result struct {
	Url    string `json:"url"`
	Result Tag    `json:"result"`
}

type Tag struct {
	Tag Tags `json:"tag"`
}

type Tags struct {
	Classes []string `json:"classes"`
}

type Classes struct {
	Tag []string `json:"classes"`
}

func ClarafaiTag() {
	form := url.Values{"url": {"http://zacc.xyz/pictures/Picture0.jpg"}}
	//something := strings.NewReader(form.Encode())
	// fmt.Print(form.Encode())
	request, err := http.NewRequest("GET", "https://api.clarifai.com/v1/tag/?"+form.Encode(), nil)
	client := &http.Client{}
	request.Header.Set("Authorization", "Bearer ZdoTcF7jWrTSLF6jmtDRHkGNhgp4Jy")
	if err != nil {
		panic(err)
	}
	response, err1 := client.Do(request)
	if err1 != nil {
		panic(err1)
	}
	defer response.Body.Close()
	log.Print(response.Body)

	buf := new(bytes.Buffer)
	buf.ReadFrom(response.Body)
	// fmt.Println(buf.String())
	//nswer := buf.String()

	m := Results{}
	json.Unmarshal(buf.Bytes(), &m)
	//fmt.Printf("%+v\n", m)
	fmt.Println(m.Results[0].Result.Tag.Classes)
}

func TakePictures(w http.ResponseWriter, r *http.Request) {
	os.Chdir("./pictures")

	CameraShot("/dev/video0", "Picture0.jpg")
	CameraShot("/dev/video1", "Picture1.jpg")
	os.Chdir("../")
}

func CameraShot(device string, pictureFile string) {
	cmd := exec.Command("/usr/bin/fswebcam", "-r", "1280x720", pictureFile, "-d", device)
	out, err := cmd.Output()
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	fmt.Print(string(out))
}

func Rest(w http.ResponseWriter, r *http.Request) {
	match := new(mux.RouteMatch)
	if Router.Match(r, match) {
		match.Handler.ServeHTTP(w, r)
	} else {
		fs.ServeHTTP(w, r)
	}
}

func InitServer() {
	wd, err := os.Getwd()
	if err != nil {
		panic(err) //ask how to do correctly TODO
	}
	path := fmt.Sprintf("%s/pictures", wd)
	fs = http.FileServer(http.Dir(path))
	Router.HandleFunc("/takepictures", TakePictures)
	http.HandleFunc("/", Rest)
	http.ListenAndServe(":80", nil)
}

func main() {
	InitServer()
}
