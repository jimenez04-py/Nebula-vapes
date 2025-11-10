import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';


gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements AfterViewInit {

  mostrarModal = false;

  modalAbierto: boolean = false;

  // Nuevo: lista de productos con imagenes y sabores por producto
  products = [
    {
      id: 'WAKA',
      name: 'WAKA',
      price: '$350',
      image: 'https://nimbusmx.com/cdn/shop/files/Waka15k.webp?v=1730955334',
      flavors: [
        'FRESH MIN',
        'KIWI DRAGON BERRY',
        'WATERMELON KIWI',
        'PEACH BLUE RASPBERRY',
        'PEACH MANGO WATERMELON',
        'STRAWBERRY WATERMELON',
        'STRAWBERRY BURST'
      ]
    },
    {
      id: 'FASTA',
      name: 'FASTA',
      price: '$350',
      image: 'https://mipod.com/cdn/shop/files/Fasta-Burrst_Sour-Blue-Razz_A2_600x600_3edf7f2b-65df-4f3a-8a4d-a59a0b521ce8.png?v=1736283680&width=600',
      flavors: [
        'FUCKING FAB SODA',
	      'FROZEN SOUR APPLE',
        'JUICY PEACH SODA',
      	'GRAPE SODA',
        'FROZEN WHITE GRAPE',
	      'FROZEN PEACH MANGO WATERMELON',
  	    '2 FROZEN WATERMELON'
      ]
    },
    {
      id: 'RODMAN',
      name: 'RODMAN',
      price: '$250',
      image: 'https://lavaperia.com/cdn/shop/files/pineapplebananaice1000px.webp?v=1759789448&width=510',
      flavors: [
        '2 ALLSTAR',
        '2 COOL MINT',
        'RODZILLA',
        'THE WORM',
        'RODMAN BLAST',
        'THE MENACE',
        'HALL OF FAME'
      ]
    },
    {
      id: 'ELUX',
      name: 'ELUX',
      price: '$350',
      image: 'https://vapematemx.com/cdn/shop/files/elux18000tesla.png?v=1740182401',
      flavors: [
        'LOST CHERRY',
        'STRAWLANDS',
        'STRAWBERRY WATERMELON',
        'BLUEBERRY WATERMELON',
        'BLUE RAZZ ICE'
      ]
    }
  ];

  productoSeleccionadoData: {
    id: string;
    name: string;
    price?: string;
    image?: string;
    flavors: string[];
  } | null = null;

  // Marca los sabores especiales para RODMAN
  private rodmanSpecials = new Set([
    'RODZILLA',
    'THE WORM',
    'RODMAN BLAST',
    'THE MENACE'
  ]);

  abrirModal(productId: string) {
    this.productoSeleccionadoData = this.products.find(p => p.id === productId) || null;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.productoSeleccionadoData = null;
  }

  isSpecial(productId: string, flavor: string): boolean {
    if (!productId || !flavor) return false;
    if (productId.toUpperCase() !== 'RODMAN') return false;
    return this.rodmanSpecials.has(flavor.toUpperCase().trim());
  }

  ngAfterViewInit() {
    // Animación inicial
    gsap.to('.vape', {
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: 'power3.out'
    });

    // Movimiento con scroll
    gsap.to('.vape', {
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      },
      y: 270,
      scale: 1.2,
      ease: 'power1.out'
    });
  }
}

