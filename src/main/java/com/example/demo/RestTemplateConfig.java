package com.example.demo;

import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.client5.http.ssl.SSLConnectionSocketFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;
import java.io.InputStream;
import java.security.KeyStore;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) throws Exception {
        // โหลดไฟล์ Certificate จากโฟลเดอร์ resources/certs
        ClassPathResource resource = new ClassPathResource("certs/tu_api.crt");
        InputStream inputStream = resource.getInputStream();

        // สร้าง Certificate จากไฟล์
        CertificateFactory cf = CertificateFactory.getInstance("X.509");
        X509Certificate certificate = (X509Certificate) cf.generateCertificate(inputStream);

        // สร้าง Keystore และเพิ่ม Certificate ของเราเข้าไป
        KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
        keyStore.load(null, null);
        keyStore.setCertificateEntry("tu-api", certificate);

        // สร้าง TrustManager ที่จะเชื่อถือ Keystore ของเรา
        TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        tmf.init(keyStore);

        // สร้าง SSL Context จาก TrustManager
        SSLContext sslContext = SSLContext.getInstance("TLS");
        sslContext.init(null, tmf.getTrustManagers(), null);

        // สร้าง SSL Connection Socket Factory
        SSLConnectionSocketFactory socketFactory = new SSLConnectionSocketFactory(sslContext);

        // สร้าง Connection Manager และ Client ที่ใช้ SSL Factory ของเรา
        var connectionManager = PoolingHttpClientConnectionManagerBuilder.create()
                .setSSLSocketFactory(socketFactory)
                .build();

        var httpClient = HttpClients.custom().setConnectionManager(connectionManager).build();

        // สร้าง RestTemplate ที่ใช้ HttpClient ที่เราตั้งค่าไว้
        return builder
                .requestFactory(() -> new HttpComponentsClientHttpRequestFactory(httpClient))
                .build();
    }
}