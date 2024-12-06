import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})

export class HomePage implements OnInit {
  cidade: string = '';
  resultado: any = null;
  aviso: string = '';
  carregando: boolean = false;

  previsaoHoraria: any[] = [];
  previsaoDiaria: any[] = [];

  ngOnInit() {
    this.obterLocalizacao();
  }

  async buscarClima(cidade?: string) {
    this.carregando = true;
    this.aviso = 'Carregando...';
    this.resultado = null;

    const input = cidade || this.cidade;
    if (input.trim() !== '') {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURI(input)}&appid=ef60a79c9c3ca99f2edfad01fd9badb3&units=metric&lang=pt_br`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === 200) {
          this.mostrarInfo({
            name: data.name,
            country: data.sys.country,
            temp: data.main.temp,
            tempIcon: data.weather[0].icon,
            windSpeed: data.wind.speed,
            descri: data.weather[0].description,
          });
        
        console.log(data.coord.lat, data.coord.lon)

        this.buscarPrevisao(data.coord.lat, data.coord.lon)

          this.aviso = '';
        } else {
          this.aviso = 'Não encontramos essa localização';
        }
      } catch (error) {
        this.aviso = 'Erro ao buscar os dados';
      }
    } else {
      this.aviso = 'Digite uma cidade válida';
    }

    this.carregando = false;
  }

  mostrarInfo(data: any) {
    this.resultado = {
      titulo: `${data.name}, ${data.country}`,
      temperatura: `${data.temp} ºC`,
      descricao: data.descri,
      vento: `${data.windSpeed} km/h`,
      icone: `https://openweathermap.org/img/wn/${data.tempIcon}.png`,
    };
  }

  limparAviso() {
    this.aviso = '';
  }

  async buscarClimaPorCoordenadas(lat: number, lon: number) {
    this.carregando = true;
    this.aviso = 'Carregando...';
    this.resultado = null;
  
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=ef60a79c9c3ca99f2edfad01fd9badb3&units=metric&lang=pt_br`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.cod === 200) {
        this.mostrarInfo({
          name: data.name,
          country: data.sys.country,
          temp: data.main.temp,
          tempIcon: data.weather[0].icon,
          windSpeed: data.wind.speed,
          descri: data.weather[0].description,
        });
        this.aviso = '';
      } else {
        this.aviso = 'Não encontramos a localização atual.';
      }
    } catch (error) {
      this.aviso = 'Erro ao buscar os dados.';
      console.error(error);
    }
  
    this.carregando = false;
  }

  async obterLocalizacao() {
    try {
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;
  
      // Use latitude e longitude para buscar o clima
      this.buscarClimaPorCoordenadas(latitude, longitude);
    } catch (error) {
      this.aviso = 'Não foi possível acessar sua localização.';
      console.error(error);
    }
  }

  async buscarPrevisao(lat: number, lon: number) {

    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely&appid=495c4f4b2715b379f544d2eb8f035008&units=metric&lang=pt_br`;
  
    try {
      console.log("fui chamado")
      const response = await fetch(url);

      const data = await response.json();
  
      if (data.hourly && data.daily) {
        // Previsão horária - próximas 24 horas
        this.previsaoHoraria = data.hourly.slice(0, 24).map((item: any) => ({
          hora: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temperatura: `${item.temp} ºC`,
          icone: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`,
        }));
  
        // Previsão diária - próximos 7 dias
        this.previsaoDiaria = data.daily.slice(0, 7).map((item: any) => ({
          dia: new Date(item.dt * 1000).toLocaleDateString([], { weekday: 'long' }),
          temperatura: `Máx: ${item.temp.max} ºC, Mín: ${item.temp.min} ºC`,
          icone: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`,
          descricao: item.weather[0].description,
        }));
      } else {
        console.error("Dados de previsão não encontrados", data);
        this.aviso = 'Erro ao buscar previsões horárias e diárias.';
      }
    } catch (error) {
      this.aviso = 'Erro ao buscar as previsões detalhadas.';
      console.log("dei erro no buscarPrevisao")
      console.error(error);
    }
  }
}