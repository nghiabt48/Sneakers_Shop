import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput, FlatList, ToastAndroid, ScrollView
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Modal from "react-native-modal";
import AxiosIntance from "../../AxiosIntance";
import * as ImagePicker from 'expo-image-picker';
const ProblemReport = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalPhongVisible, setisModalPhongVisible] = useState(false)
  const [loaiSuCo, setloaiSuCo] = useState([])
  const [currentChoosing, setcurrentChoosing] = useState("")
  const [currentPhongChoosing, setcurrentPhongChoosing] = useState("")
  const [dataPhong, setdataPhong] = useState([])
  const [moTa, setmoTa] = useState("")
  const [selectedImage, setSelectedImage] = useState(null);
  useEffect(() => {
    const getListLoaiSuCo = async () => {
      const response = await AxiosIntance().get("/su-co/loai?phong_tiep_nhan=ky_thuat");
      if (response.status == "success") {
        setloaiSuCo(response.data);
      } else {
        ToastAndroid.show("Lay du lieu that bai", ToastAndroid.SHORT);
        setloaiSuCo(null)
      }
    }
    const getListPhongTheoToa = async () => {
      const response = await AxiosIntance().get("/phong-hoc/T");
      if (response.status == "success") {
        setdataPhong(response.data);
      } else {
        ToastAndroid.show("Lay du lieu that bai", ToastAndroid.SHORT);
        setdataPhong(null)
      }
    }
    getListLoaiSuCo()
    getListPhongTheoToa()
    return () => {

    }
  }, [])

  const navigation = useNavigation();
  const goBack = () => {
    navigation.goBack();
  };

  //Hiển thị bảng chọn Bao Cao Su Co & List Phong
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const toggleModalPhong = () => {
    setisModalPhongVisible(!isModalPhongVisible);
  };
  const sendReport = async () => {
    const response = await AxiosIntance().post("/su-co/add", {
      loaiSuCo: currentChoosing,
      moTa,
      phongHoc: currentPhongChoosing,
      hinhAnh: selectedImage,
    });
      if (response.status == "success") {
        ToastAndroid.show("Your report has been sent!", ToastAndroid.SHORT);
        clearForm()
      } else {
        ToastAndroid.show("Something went wrong.", ToastAndroid.SHORT);
      }
  }
  const clearForm = () => {
    setcurrentChoosing("")
    setcurrentPhongChoosing("")
    setmoTa(null)
    setSelectedImage(null)
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    //form data để upload file
    const formData = new FormData();
    formData.append("hinhAnh", {
      uri: result.assets[0].uri,
      type: "image/jpeg",
      name: "image.jpg",
    }); 
    //chạy api  
    const respone = await AxiosIntance("multipart/form-data").post(
      "/su-co/image-upload",
      formData
    );
    if (!result.canceled) {
      if (respone.status === "success") {
        ToastAndroid.show("Update Image Successfully", ToastAndroid.SHORT);
        setSelectedImage(respone.path)
        console.log(respone.path);
      } else {
        ToastAndroid.show("Update Image Failed", ToastAndroid.SHORT);
      }
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container2}>
        <TouchableOpacity onPress={goBack}>
          <Image
            style={styles.navigationBack}
            source={require("../images/back.png")}
          />
        </TouchableOpacity>
        <Text style={styles.text1}>Báo cáo sự cố</Text>
      </View>
      <TouchableOpacity style={styles.edtProblem} onPress={toggleModalPhong}>
        <Text style={currentPhongChoosing != "" ? styles.text5 : styles.text4}>{currentPhongChoosing != "" ? currentPhongChoosing : 'Phòng'} </Text>
        <Image
          style={styles.btnDropdown}
          source={require("../images/dropdown.png")}
          onPress={toggleModal}
        />
      </TouchableOpacity>
      <Modal isVisible={isModalPhongVisible}  onBackdropPress={toggleModalPhong}>
        <ScrollView style={styles.modalContainer}>
          {dataPhong.map((item, index) => (
            <TouchableOpacity key={index} onPress={() => {
              setcurrentPhongChoosing(item.tenPhong)
              setisModalPhongVisible(!isModalPhongVisible)
            }
              } style={styles.btnProblem}>
              <Text style={styles.txtProblem}>{item.tenPhong}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Modal>

      <TouchableOpacity style={styles.edtProblem} onPress={toggleModal}>
        <Text style={currentChoosing != "" ? styles.text5 : styles.text4}>{currentChoosing != "" ? currentChoosing : 'Sự cố đang gặp phải'} </Text>
        <Image
          style={styles.btnDropdown}
          source={require("../images/dropdown.png")}
          onPress={toggleModal}
        />
      </TouchableOpacity>
      <Modal isVisible={isModalVisible}  onBackdropPress={toggleModal}>
        <View style={styles.modalContainer}>
          {loaiSuCo? loaiSuCo.map((item, index) => (
            <TouchableOpacity key={index} onPress={() => {
              setcurrentChoosing(item.ten)
              setModalVisible(!isModalVisible)
            }
              } style={styles.btnProblem}>
              <Text style={styles.txtProblem}>{item.ten}</Text>
            </TouchableOpacity>
          )) : null}
        </View>
      </Modal>
      <TextInput
        style={styles.edtDescription}
        placeholder="Mô tả sự cố"
        onChangeText={(newText) => setmoTa(newText)}
        value={moTa}
        placeholderTextColor={"rgba(0, 0, 0, 0.32)"}
        returnKeyType="go"
        autoCorrect={false}
      ></TextInput> 
      <View style={{ flexDirection: "row", marginTop: 24 }}>
        <TouchableOpacity style={styles.btnCamera}>
          <Image source={require("../images/camera.png")} />
        </TouchableOpacity> 
        <TouchableOpacity style={styles.btnImage} onPress={pickImage}>
          <Image source={require("../images/image.png")} />
        </TouchableOpacity>
      </View>
      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={{ width: 200, height: 200,alignSelf:"center"}} />
      )}
      <TouchableOpacity style={styles.btnSend} onPress={sendReport}>
        <Text style={styles.text2}>Gửi yêu cầu</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ProblemReport;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container2: {
    flexDirection: "row",
    marginTop: 24,
  },
  navigationBack: {
    width: 24,
    height: 24,
    marginStart: 24,
    marginTop: 5,
  },
  text1: {
    marginStart: 70,
    color: "rgba(0, 0, 0, 0.87)",
    fontSize: 24,
    fontWeight: "700",
  },
  edtRoom: {
    width: "90%",
    height: "6%",
    marginStart: 16,
    marginEnd: 16,
    marginTop: 40,
    backgroundColor: "#F1F4F5",
    borderRadius: 6,
    borderStyle: "solid",
    borderColor: "rgba(0, 0, 0, 0.10)",
    borderWidth: 0.5,
    padding: 11,
    fontSize: 16,
    fontWeight: "400",
  },
  edtProblem: {
    width: "90%",
    height: "6%",
    marginStart: 16,
    marginEnd: 16,
    marginTop: 24,
    backgroundColor: "#F1F4F5",
    borderRadius: 6,
    borderStyle: "solid",
    borderColor: "rgba(0, 0, 0, 0.10)",
    borderWidth: 0.5,
    padding: 11,
    fontSize: 14,
    fontWeight: "400",
  },
  text3: {
    color: "rgba(0, 0, 0, 0.32)",
    fontSize: 14,
    fontWeight: "400",
  },
  text4: {
    color: "rgba(0, 0, 0, 0.32)",
    fontSize: 14,
    fontWeight: "400",
  },
  text5: {
    color: "rgba(0, 0, 0, 0.87)",
    fontSize: 14,
    fontWeight: "400",
  },
  btnDropdown: {
    marginStart: 300,
    marginTop: -20,
  },
  edtDescription: {
    width: "90%",
    height: "20%",
    marginStart: 16,
    marginEnd: 16,
    marginTop: 24,
    backgroundColor: "#F1F4F5",
    borderRadius: 6,
    borderStyle: "solid",
    borderColor: "rgba(0, 0, 0, 0.10)",
    borderWidth: 0.5,
    padding: 11,
    fontSize: 16,
    fontWeight: "400",
    textAlign: "left",
    textAlignVertical: "top",
  },
  btnCamera: {
    paddingVertical: 8,
    paddingHorizontal: 73,
    alignItems: "flex-start",
    backgroundColor: "#E6E6E7",
    gap: 4,
    borderRadius: 8,
    borderStyle: "solid",
    borderColor: "#CACACA",
    borderWidth: 1,
    marginStart: 16,
  },
  btnImage: {
    paddingVertical: 8,
    paddingHorizontal: 73,
    backgroundColor: "#E6E6E7",
    gap: 4,
    borderRadius: 8,
    borderStyle: "solid",
    borderColor: "#CACACA",
    borderWidth: 1,
    marginStart: 10,
    marginEnd: 16,
    alignItems: "flex-start",
  },
  btnSend: {
    width: "90%",
    height: "5%",
    marginTop: 40,
    marginStart: 16,
    marginEnd: 16,
    backgroundColor: "#3257C6",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 33,
    borderRadius: 8,
    justifyContent: "center",
    gap: 10,
    flexShrink: 0,
  },
  text2: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  modalContainer: {
    paddingTop: 10,
    paddingBottom: 24,
    paddingHorizontal: 7,
    borderRadius: 12,
    borderRightWidth: 1,
    borderRightColor: "#C8C8C8",
    borderLeftWidth: 1,
    borderLeftColor: "#C8C8C8",
    backgroundColor: "#EDEDED",
    alignSelf: "center",
    padding: 20,
    borderRadius: 10,
  },
  btnConfirm: {
    width: 91,
    height: 30,
    alignSelf: "center",
    marginTop: 13,
    backgroundColor: "#2245AC",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  text3: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  btnProblem: {
    width: 329,
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexShrink: 0,
    padding: 10,
  },
  btnProblem2: {
    width: 329,
    height: 40,
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexShrink: 0,
    padding: 10,
  },
  btnProblem3: {
    width: 329,
    height: 40,
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexShrink: 0,
    padding: 10,
  },
  btnProblem4: {
    width: 329,
    height: 40,
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexShrink: 0,
    padding: 10,
  },
  btnProblem5: {
    width: 329,
    height: 40,
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexShrink: 0,
    padding: 10,
  },
  txtProblem: {
    color: "rgba(0, 0, 0, 0.87)",
    fontSize: 14,
    fontWeight: "400",
  }
});
