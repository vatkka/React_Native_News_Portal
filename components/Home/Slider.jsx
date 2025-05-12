import React, { useEffect } from 'react';
import { FlatList, StyleSheet, View , Image, Dimensions} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { useState } from 'react';
export default function Slider(){

    const [sliderList, setSliderList] = useState([]);

    useEffect(() => {
        GetSlides();
    }, []);

    const GetSlides = async() => {
        setSliderList([]);
        const snapshot = await getDocs(collection(db, "Slider"));
        snapshot.forEach(doc => {
            console.log(doc.data());
            setSliderList(sliderList=>[...sliderList, doc.data()]);
        });
    }


    return (
        <View
        style={{marginTop: 10}}
        >
            <FlatList
                data={sliderList}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                renderItem={({item, index}) => (
                    <View>
                        <Image source={{uri:item?.imageUrl}} style={styles?.sliderList}/>
                    </View>
                )}
            />
        </View>
    );
}


const styles = StyleSheet.create({
    sliderList: {
        width: Dimensions.get('window').width*0.9,
        height: 150,
        borderRadius: 10,
        margin:2,
    }
 });